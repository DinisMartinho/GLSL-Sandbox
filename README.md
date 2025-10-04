# GLSL Sandbox

This is a real-time, multi-pass GLSL shader editor.

The main goal of this project wasn't just to build a shader tool, but to see how useful an agentic AI (Google's Gemini) actually is for building a web app from scratch. I'm also currently learning GLSL shaders, so building a sandbox for myself seemed like a good way to do it.


## The Process

The whole app was built in less than 12 hours. A lot of that time was just me having fun and messing around with the shaders, not actually writing application code. The AI handled almost all of the boilerplate for React and, more importantly, for Three.js, a library I had never used before.

Had I tried to build this myself from scratch, it would have taken me much, much longer. But there's a trade-off: by the end, I'd probably know Three.js much better than I do now. After this project, I still have very little idea how Three.js actually works under the hood because the AI handled the implementation details.


## Working with the AI

One thing I learned quickly was that giving the AI a broad, high-level goal like "build me a shader editor" produced pretty mediocre results.

It performed much better when I narrowed its focus. I had to break down complex features into a series of smaller, simpler requests. By telling it exactly what tools to use, what style I wanted, and guiding it step-by-step, the quality of the output improved dramatically.

The code it produced works, but I'll be the first to admit it's messy. It's a direct reflection of the process: prioritizing speed and functionality over clean architecture. For a rapid prototype and a learning experiment, it was a worthwhile trade-off.

Overall, this experiment showed that agentic AI can be a powerful accelerator for development. It's clear these tools can bring a lot of value, particularly for rapid prototyping or for developers venturing into unfamiliar technical domains.
