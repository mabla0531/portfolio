export default function Skills() {
  return (
    <div class="flex w-full h-full justify-center items-center gap-2 p-4">
      <button 
        class="material-symbols-outlined w-8 h-8 p-0 btn btn-ghost"
        onclick={() => document.getElementById("skills_carousel").scrollBy({left: -1, top: 0})}
      >
        arrow_back_ios
      </button>
      <div id="skills_carousel" class="carousel carousel-horizontal carousel-center w-72 max-w-full">
        <div class="carousel-item w-full flex flex-col gap-4">
          <div class="text-2xl font-bold w-full text-center">Languages</div>
          <div class="w-full p-2">
            <div class="flex justify-between w-full">
              <div>Rust</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>C#</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>C++</div>
              <div class="my-auto badge badge-secondary badge-soft">intermediate</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>TypeScript</div>
              <div class="my-auto badge badge-secondary badge-soft">intermediate</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Go</div>
              <div class="my-auto badge badge-info badge-soft">beginning</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Zig</div>
              <div class="my-auto badge badge-info badge-soft">beginning</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Python</div>
              <div class="my-auto badge badge-info badge-soft">beginning</div>
            </div>
          </div>
        </div>
        <div class="carousel-item w-full flex flex-col gap-4">
          <div class="text-2xl font-bold w-full text-center">Systems Engineering</div>
          <div class="w-full p-2">
            <div class="flex justify-between w-full">
              <div>Interop/FFI</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>IPC</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Microservice Architecture</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>SQL/State Transfer</div>
              <div class="my-auto badge badge-secondary badge-soft">intermediate</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>TLS</div>
              <div class="my-auto badge badge-secondary badge-soft">intermediate</div>
            </div>
          </div>
        </div>
        <div class="carousel-item w-full flex flex-col gap-4">
          <div class="text-2xl font-bold w-full text-center">Frontend/Backend</div>
          <div class="w-full p-2">
            <div class="flex justify-between w-full">
              <div>React</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Svelte</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>REST</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>UI/UX</div>
              <div class="my-auto badge badge-secondary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Dioxus (multiplatform)</div>
              <div class="my-auto badge badge-secondary badge-soft">enterprise</div>
            </div>
          </div>
        </div>
        <div class="carousel-item w-full flex flex-col gap-4">
          <div class="text-2xl font-bold w-full text-center">Miscellaneous</div>
          <div class="w-full p-2">
            <div class="flex justify-between w-full">
              <div>Linux</div>
              <div class="my-auto badge badge-accent badge-soft">daily-drive</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>NPM/Vite</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>CCR+DSS</div>
              <div class="my-auto badge badge-primary badge-soft">enterprise</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Terminal UI Design</div>
              <div class="my-auto badge badge-primary badge-soft">advanced</div>
            </div><div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Nats/Kafka</div>
              <div class="my-auto badge badge-secondary badge-soft">intermediate</div>
            </div>
            <div class="divider"/>
            <div class="flex justify-between w-full">
              <div>Kubernetes</div>
              <div class="my-auto badge badge-info badge-soft">beginning</div>
            </div>
          </div>
        </div>
      </div>
      <button
        class="material-symbols-outlined w-8 h-8 p-0 btn btn-ghost"
        onclick={() => document.getElementById("skills_carousel").scrollBy({left: 1, top: 0})}
      >
        arrow_forward_ios
      </button>
    </div>
  )
}
