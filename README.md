# GLSL Sandbox

<div align="center">
  <img src="/imgs/gemini.png" alt="Gemini Logo" width="150"/>
</div>

<br>

This is a real-time, multi-pass GLSL shader editor I built to see if an agentic AI (Google's Gemini) could actually help build a web app from scratch. I'm also learning GLSL, so making my own sandbox seemed like a good way to kill two birds with one stone.

<p align="center">
  <img src="/imgs/screenshot_1.png" alt="Application Screenshot 1" width="700"/>
</p>

---

### The Process

The whole app was built in **less than 12 hours**. A lot of that time was just me having fun and messing around with shaders, not actually writing application code.

The AI handled almost all of the boilerplate for React and, more importantly, for **Three.js**, a library I had never used before.

Had I tried to build this myself from scratch, it would have taken me much, much longer. But there's a trade-off: I'd probably know Three.js much better by the end. After this project, I still have very little idea how Three.js actually works because the AI handled the implementation details.

<p align="center">
  <img src="/imgs/screenshot_2.png" alt="Application Screenshot 2" width="700"/>
</p>

---

### How to Actually Work With the AI

One thing I learned quickly was that giving the AI a broad, high-level goal like "build me a shader editor" produced pretty mediocre results. It just wasn't very useful.

It performed much better when I narrowed its focus. I had to break down what I wanted into a series of smaller, simpler requests. By telling it exactly what tools to use, what style I wanted, and guiding it step-by-step, the quality of the output improved dramatically.

**The code itself?** It works, but I'll be the first to admit it's messy. It's a direct reflection of the process: prioritize speed and functionality over clean architecture. For a rapid prototype and a learning experiment, it was a worthwhile trade-off.

<p align="center">
  <img src="/imgs/screenshot_3.png" alt="Application Screenshot 3" width="700"/>
</p>

---

### So, what's the verdict?

This experiment showed that AI can be a powerful **accelerator** for development. It's clear these tools can bring a lot of value, particularly for getting a prototype off the ground or for developers venturing into unfamiliar territory like I was with Three.js.
