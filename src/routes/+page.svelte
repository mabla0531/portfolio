<script lang="ts">
	import x from '$lib/assets/x.svg';
	import email from '$lib/assets/email.svg';
	import github from '$lib/assets/github.svg';
	import linkedin from '$lib/assets/linkedin.svg';
</script>

<div class="mx-auto flex w-full max-w-lg flex-col items-center bg-base-100 p-16 md:w-2/3 md:px-0">
	<div class="flex flex-col items-center justify-center">
		<div>
			<div class="text-lg md:text-xl">Hi, I'm</div>
			<div class="text-4xl md:text-5xl">Matthew Bland</div>
			<div class="md:text-md text-sm italic">Systems Engineer + Fullstack Developer</div>
		</div>
	</div>
	<div class="divider" />
	<div>
		<div class="text-xl">Notable skills include:</div>
		<ul class="list-disc">
			<li>
				Decent understanding of Rust, including:
				<ul class="ml-4 list-[circle]">
					<li>Async semantics and (mindful) use of thread-sync constructs</li>
					<li>Progressive modernization via FFI (C# and C++)</li>
					<li>
						Consequently, decent understanding of the C ABI and how to run an ownership-based
						language in a garbage-collected one
					</li>
					<li>Embedded (no-std)</li>
				</ul>
			</li>
			<li>Quality understanding of C#, though dated (CCR/DSS on .NET 4.7.2)</li>
			<li>
				REST adherence (my POST's aren't GET's with bodies lol)
				<ul class="ml-4 list-[circle]">
					<li>Implementation of server-sent event streams to+from Rust, JS, and C#</li>
				</ul>
			</li>
			<li>WebSockets</li>
			<li>gRPC</li>
			<li>
				Database engines+flavors, including:
				<ul class="ml-4 list-[circle]">
					<li>MSSQL (loosely)</li>
					<li>SQLite</li>
					<li>Postgres (including NOTIFY)</li>
				</ul>
			</li>
			<li>Kubernetes+Docker, Azure (AKS/ACR)</li>
			<li>Linux and GNU Coreutils/BASH</li>
		</ul>
	</div>
	<div class="divider" />
	<div>
		<div class="text-xl">Term Dump (professional experience using):</div>
		Rust, C#, C, C++, JS/TS, NATS, gRPC, Linux, React, Svelte, Dioxus, Tauri, SSE, WebSockets, Tokio,
		Ratatui, optimizations e.g. avx512 + mmap, hotreloading config
	</div>
	<div class="divider" />
	<div class="flex flex-col gap-2">
		<div class="flex justify-center text-xl">Let's get in touch!</div>
		<div class="flex justify-center gap-2">
			<button class="btn btn-circle border-none! btn-ghost p-1 hover:scale-110">
				<img src={x} class="h-8 w-8" />
			</button>
			<button class="btn btn-circle border-none! btn-ghost p-1 hover:scale-110">
				<img src={linkedin} class="h-8 w-8" />
			</button>
			<button class="btn btn-circle border-none! btn-ghost p-1 hover:scale-110">
				<img src={github} class="h-8 w-8" />
			</button>
		</div>
		<div class="flex justify-center">
			<div class="flex items-center justify-center gap-1">
				<img src={email} class="h-5 w-5" />
				<div>matthewbl531 [at] icloud [dot] com</div>
			</div>
		</div>
	</div>
</div>
