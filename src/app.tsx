import { createSignal } from "solid-js";
import "./app.css";
import Intro from "./pages/intro.tsx";
import Skills from "./pages/skills.tsx";
import Projects from "./pages/projects.tsx";
import Contact from "./pages/contact.tsx";

export default function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <div role="tablist" class="sticky top-0 left-0 flex w-full gap-2 justify-center tabs">
        <a role="tab" class="tab text-lg" href="#skills">Skills</a>
        <a role="tab" class="tab text-lg" href="#projects">Projects</a>
        <a role="tab" class="tab text-lg" href="#contact">Contact</a>
      </div>
      <div class="carousel carousel-vertical w-full h-[calc(100%-40px)]">
        <div id="intro" class="carousel-item w-full h-full"><Intro/></div>
        <div id="skills" class="carousel-item w-full h-full"><Skills/></div>
        <div id="projects" class="carousel-item w-full h-full"><Projects/></div>
      </div>
    </>
  );
}
