// ==UserScript==
// @name         BetterPlayground
// @namespace    https://github.com/Heath123/
// @version      0.1
// @description  Adds features such as logit bias to the OpenAI Playground
// @author       Heath123
// @match        https://beta.openai.com/playground*
// @icon         https://www.google.com/s2/favicons?domain=openai.com
// @grant        GM.xmlHttpRequest
// @connect      openaiapi-site.azureedge.net
// @run-at       document-start
// ==/UserScript==

// Hi! You should always read over code that could access sensitive data so I've tried
// to make this easy to understand, even though it's a bit of a mess.

// Inject custom styling to make the normal editor that supports logprobs look like
// the code editor when using Codex models
const style = document.createElement('style')
style.innerHTML = `
body.betterplayground-using-code-model .completions-container * {
    font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace;
    font-size: 14px!important;
    font-weight: normal;
}

body.betterplayground-using-code-model .public-DraftEditor-content {
    padding-left: 59px;
    padding-top: 10px;
}
`
document.head.appendChild(style)

const oldAppendChild = document.head.appendChild

// Ugly way to patch the script by changing it when it's loaded
document.head.appendChild = function(child) {
    // This regex detects the budle containing the main code
    const matches = child.src && child.src.match(/^https:\/\/openaiapi-site\.azureedge\.net\/public-assets\/d\/[0-9a-f]*\/static\/js\/10\.[0-9a-f]*\.chunk\.js$/)
    if (child.tagName === "SCRIPT" && matches) {
        // Use the GreaseMonkey xmlHttpRequest object to bypass CORS while fetching the script
        GM.xmlHttpRequest({
            method: "GET",
            url: matches[0],
            onload: (response) => {
                let scriptText = response.responseText

                // Patches for the script

                // Make this object global so we can modify the functions in it and call them
                // TODO: Better name :)
                scriptText = scriptText.replace("showFeedbackButtons:!1},a}",
                                                "showFeedbackButtons:!1},window.globalThing=a,a}")
                // Tell the logic that hides "Show probablilities" option that we are never using a Codex model so it is never hidden
                scriptText = scriptText.replace("var l=Object(Q.d)(e.engine.value);",
                                                "var l=false;")
                // Make it not use a code editor when "Show probabilities" is on because the code editor doesn't support it
                // Still provide an override to get the original value from this script when needed
                scriptText = scriptText.replace("a.isCodeEditor=function(){return Object(Q.d)(a.state.modelParameters.engine.value)}",
                                                "a.isCodeEditor=function(getOrigValue){if(!getOrigValue&&a.state.probsType!==null) return false;return Object(Q.d)(a.state.modelParameters.engine.value)}")
                // Preserve the text when enabling "Show probabilities" forces the code editor off
                scriptText = scriptText.replace("a.updateProbsType=function(e){",
                                                "a.updateProbsType=function(e){a.previousEditorText = a.getEditorText();a.setIsChanged();")
                // Allow editing the request JSON to inject logit bias
                scriptText = scriptText.replace("var i={prompt:",
                                                "var i=editParams({prompt:")
                scriptText = scriptText.replace(",echo:!0}",
                                                ",echo:!0})")

                // Instead of appending a script with the original URL, make one with the patched JS
                const script = document.createElement('script')
                script.setAttribute('type', 'text/javascript')
                script.innerHTML = scriptText
                oldAppendChild.call(this, script)
            }
        })
        return
    }

    // According to https://trackjs.com/blog/how-to-wrap-javascript-functions/ this is
    // the best way to do it
    const returnValue = oldAppendChild.call(this, child)
    return returnValue
}

// Edit the JSON data to inject logit bias
unsafeWindow.editParams = function (jsonBody) {
    // Handle logit bias
    const logitInput = document.getElementById("betterplayground-logit")
    if (logitInput.value.trim() !== "") {
        let logitData
        // TODO: Check for malformed data that is valid JSON, but not a string to number
        // dictionary
        try {
            logitData = JSON.parse(logitInput.value)
            jsonBody.logit_bias = logitData
        } catch (e) {
            alert("Malformed logit bias JSON!")
        }
    }

    return jsonBody
}

// Wait until playground is loaded
window.addEventListener("load", () => {
    // TODO: Do this in a cleaner way
    const interval = setInterval(() => {
        // Wait until the page is loaded
        if (!document.querySelector(".parameter-panel-grid")) return
        clearInterval(interval)
        console.log("BetterPlayground: Injecting custom controls")

        // Wrap the onModelParamChange to update styles
        const oldOnModelParamChange = unsafeWindow.globalThing.onModelParamChange

        function updateStyle (modelName) {
            if (modelName.includes("codex")) {
                document.body.classList.add("betterplayground-using-code-model")
            } else {
                document.body.classList.remove("betterplayground-using-code-model")
            }
        }

        unsafeWindow.globalThing.onModelParamChange = function (paramChanged, next, prev) {
            if (paramChanged === 'engine') {
                updateStyle(next)
            }

            const returnValue = oldOnModelParamChange.call(this, paramChanged, next, prev)
            return returnValue
        }

        updateStyle(globalThing.state.modelParameters.engine.value)

        const controlsPanel = document.querySelector(".parameter-panel-grid")

        const logitBiasControl = document.createElement('div')
        logitBiasControl.innerHTML = `
        <div aria-haspopup="true" aria-expanded="false">
            <div class="body-small control-label">Logit bias</div>
            <div class="inject-text-ta-wrap">
                <input type="text" id="betterplayground-logit" class="inject-text-ta" placeholder="e.g. {&quot;50256&quot;: -100}" style="padding: 6px 12px 6px 12px;"></input>
            </div>
        </div>
        `

        controlsPanel.appendChild(logitBiasControl)
    }, 100)
})
