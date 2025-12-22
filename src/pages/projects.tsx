export default function Projects() {
  return (
    <div class="flex flex-col w-full justify-center items-center gap-4 p-4">
      <div class="text-2xl font-bold">Projects</div>
      <div class="flex justify-center items-center gap-2">
        <button 
          class="material-symbols-outlined w-8 h-8 p-0 pl-2 btn btn-ghost"
          onclick={() => document.getElementById("projects_carousel").scrollBy({left: -1, top: 0})}
        >
          arrow_back_ios
        </button>
        <div id="projects_carousel" class="carousel w-64 md:w-96 max-w-full">
          <div class="carousel-item w-full">
            <div class="w-full p-2">
              <div class="card w-full bg-base-200">
                <figure>
                  <img src="./curlplusplus.png"/>
                </figure>
                <div class="card-body">
                  <div class="card-title">Curl++</div>
                  A minimal, elegant, functional HTTP client with a terminal UI, written with Rust and Ratatui
                  <div class="card-actions justify-end">
                    <a href="https://github.com/mabla0531/curlplusplus" target="_blank"><button class="btn btn-primary btn-soft">GitHub</button></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-item w-full">
            <div class="w-full p-2">
              <div class="card w-full bg-base-200">
                <figure>
                  <img src="./aster.png"/>
                </figure>
                <div class="card-body">
                  <div class="card-title">Aster</div>
                  A scalable point-of-sale software stack for cash-only transactions with pricebook and user account support
                  <div class="card-actions justify-end">
                    <a href="https://github.com/mabla0531/aster" target="_blank"><button class="btn btn-primary btn-soft">GitHub</button></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-item w-full">
            <div class="w-full p-2">
              <div class="card w-full bg-base-200">
                <figure>
                  <img src="./knocktwice.png"/>
                </figure>
                <div class="card-body">
                  <div class="card-title">KnockTwice</div>
                  A custom Shopify storefront for KnockTwice, focused on marketing unique clothing items from pre-2010
                  <div class="card-actions justify-between">
                    <a href="https://knocktwice.online" target="_blank"><button class="btn btn-secondary btn-soft">Site</button></a>
                    <a href="https://github.com/mabla0531/knocktwice" target="_blank"><button class="btn btn-primary btn-soft">GitHub</button></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button 
          class="material-symbols-outlined w-8 h-8 p-0 btn btn-ghost"
          onclick={() => document.getElementById("projects_carousel").scrollBy({left: 1, top: 0})}
        >
          arrow_forward_ios
        </button>
      </div>
    </div>
  )
}
