
export function drawLine() {
	const canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
	if (!canvas)
		return;
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;
	const { width, height } = canvas;
	const dashHeight = 16;
	const gap = 12;
	const centerX = width / 2;

	ctx.strokeStyle = "#aa8024";
	ctx.lineWidth = 2;

	for (let y = 0; y < height; y += dashHeight + gap) {
		ctx.beginPath();
		ctx.moveTo(centerX, y);
		ctx.lineTo(centerX, Math.min(y + dashHeight, height));
		ctx.stroke();
	}
}

export function drawBall(ctx: any, pos_x: number, pos_y: number, radius: number) {
	ctx.beginPath()
	ctx.arc(pos_x, pos_y, radius, 0, Math.PI * 2)
	ctx.strokeStyle = "#D2D2D2"
	// ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
	ctx.fillStyle = "#D2D2D2"
	ctx.lineWidth = 3.5
	ctx.fill()
	ctx.stroke()
	ctx.closePath()
}

export function drawPaddleRight(ctx: any, pos_x: number, pos_y: number, width: number, height: number) {
	ctx.beginPath()
	ctx.rect(pos_x, pos_y, width, height)
	ctx.fillStyle = "#aa8024"
	ctx.fill()
	ctx.closePath()
}

export function drawPaddleLeft(ctx: any, pos_x: number, pos_y: number, width: number, height: number) {
	ctx.beginPath()
	ctx.rect(pos_x, pos_y, width, height)
	ctx.fillStyle = "#aa8024"
	ctx.fill()
	ctx.closePath()
}

export function renderPong(isOnline:boolean = false): string {
	return /*ts*/`
		<div class="flex items-center justify-center h-screen w-full">
			<div class="relative w-[90vw] h-[90vh] max-w-[1200px] max-h-[900px] flex items-center justify-center">
			
				<div class="relative w-full aspect-[16/9]">
			
					<div id="pong-score"
						class="absolute top-6 left-1/2 -translate-x-1/2 flex gap-16 text-5xl font-bold text-[var(--color-primary)] select-none z-10 font-display text-[aliceblue] text-shadow-[2px_2px_#60087af6]">
						<span id="score-left" class="w-[2ch] text-center">0</span>
						${isOnline ? ""
						:
							`<button id="pause-btn" class="cursor-pointer">
								<img src="/svg/pause-circle.svg" class='w-[34px] h-[34px]'/>
							</button>`
						}
						<span id="score-right" class="w-[2ch] text-center">0</span>
					</div>

					<canvas id="pong-canvas"
						class="rounded-xl border-2 border-[var(--color-primary)] w-full h-full shadow-lg bg-[#02010f]/60">
					</canvas>

					<div id="pong-overlay"
						class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 via-[#0a0a1f]/90 to-black/80 z-20 select-none transition-all">
					</div>
				</div>

			</div>
		</div>
	`;
}
