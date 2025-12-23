import { createSignal, onMount, onCleanup } from "solid-js";
import { inject } from "@vercel/analytics";
import "./app.css";
import Intro from "./pages/intro.tsx";
import Skills from "./pages/skills.tsx";
import Projects from "./pages/projects.tsx";
import Contact from "./pages/contact.tsx";

export default function App() {
  inject();

  const [activeTab, setActiveTab] = createSignal(0);
  let carouselRef;
  let isScrolling = false;
  
  const tabs = ['About', 'Skills', 'Projects', 'Contact'];
  const items = ['about', 'skills', 'projects', 'contact'];
  
  const handleScroll = () => {
    if (!carouselRef || isScrolling) return;
    
    const scrollTop = carouselRef.scrollTop;
    const itemHeight = carouselRef.scrollHeight / items.length;
    const currentIndex = Math.round(scrollTop / itemHeight);
    
    const clampedIndex = Math.max(0, Math.min(currentIndex, items.length - 1));
    
    setActiveTab(clampedIndex);
    
    if (items[clampedIndex]) {
      history.replaceState(null, null, `#${items[clampedIndex]}`);
    }
  };
  
  const scrollToItem = (index) => {
    isScrolling = true;
    setActiveTab(index);
    
    const targetItem = document.getElementById(items[index]);
    if (targetItem) {
      targetItem.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
    
    setTimeout(() => {
      isScrolling = false;
    }, 1000);
  };
  
  onMount(() => {
    const hash = window.location.hash.slice(1);
    const index = items.indexOf(hash);
    
    if (index !== -1) {
      setTimeout(() => {
        setActiveTab(index);
        const targetItem = document.getElementById(items[index]);
        targetItem?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, 100);
    }
    
    if (carouselRef) {
      carouselRef.addEventListener('scroll', handleScroll);
      
      onCleanup(() => {
        carouselRef?.removeEventListener('scroll', handleScroll);
      });
    }
  });


  return (
    <>
      <div role="tablist" class="sticky top-0 left-0 flex w-full gap-2 justify-center tabs shadow-md">
        <For each={tabs}>
          {(tab, index) => (
            <a 
              class={`tab md:text-xl ${activeTab() === index() ? 'tab-active' : ''}`}
              onClick={() => scrollToItem(index())}
            >
              {tab}
            </a>
          )}
        </For>      
      </div>
      <div 
        class="carousel carousel-vertical w-full h-[calc(100%-40px)]" 
        ref={carouselRef}
      >
        <div id="about" class="carousel-item w-full h-full"><Intro/></div>
        <div id="skills" class="carousel-item w-full h-full"><Skills/></div>
        <div id="projects" class="carousel-item w-full h-full"><Projects/></div>
        <div id="contact" class="carousel-item w-full h-full"><Contact/></div>
      </div>
    </>
  );
}
