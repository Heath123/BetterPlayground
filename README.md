# BetterPlayground
A script to add extra features to the OpenAI playground.

**Note - please don't blindly add scripts to your browser that could access sensitive data, it's best to read the code first. See the "Is this safe?" section for more info.**

# How to install
Install TamperMonkey or any compatible extension and add script.js as a new userscript.

# Features

- Adds logit bias an an option in the right panel

![image](https://user-images.githubusercontent.com/13787163/139292022-b50898e8-8ead-4671-a383-47cc0a3b4160.png)

Note that this currently just accepts a raw JSON object - see the [docs](https://beta.openai.com/docs/api-reference/completions/create#completions/create-logit_bias) for usage info. In the future, I would like to add a proper UI for selecting tokens.

- Allows showing probabilities for Codex models

![image](https://user-images.githubusercontent.com/13787163/139293190-d10f576f-5d5c-4ed2-a0b6-5ea4781684c2.png)

Note that this disables all code editing fetaures like syntax highlighing and line numbers. In the future, it could use the normal code editor UI and add probability viewing functionality to that - currently, enabling probabilities forces using the regular text editor with a monospace font.

# Why not just provide feedback?

Well, this way people can see how it would work, and I don't have to wait. Also this is more fun.

# Is this safe?

If you're worried about me taking your API key, please read over the code first or find someone you trust to do it. I've gone out of my way to not load any code from external servers, so you can verify that I won't do anything bad. If you're worried about OpenAI banning you for this, I'm not 100% sure if it's within the terms of service to modify their site and it is detectable because there's no other way to send logit bias from a Playground session, but I doubt they would do that without just asking me politely to take this down first if they didn't like it or just making it redundant by implementing these things themselves. However, I take no responsibility for anything that happens if you use this.

# Future plans

Contributions welcome!
- A proper UI for logit bias
- Using the actual code editor when showing probabilities for Codex
- Exporting Playground setups to code
- Anything else I can think of!

# Why use the Unlicense instead of something like MIT or GPL?
I want to make sure OpenAI can use any of this (ideas or code) if they want to without needing credit or anything. I very much doubt the code is of any use because it's a huge mess that mostly just makes small patches to the original code, but just in case.
