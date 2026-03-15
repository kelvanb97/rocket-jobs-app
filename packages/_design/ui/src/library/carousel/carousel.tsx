import { ArrowLeftIcon, ArrowRightIcon } from "#assets/icons/lucide-icons"
import { Flex } from "#primitives/flex"
import { XStack } from "#primitives/x-stack"
import { cn } from "#utils/cn"
import Image from "next/image"
import {
	forwardRef,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"

export type TCarouselSlide =
	| { type: "video"; src: string }
	| { type: "image"; src: string; alt: string; width: number; height: number }

const AUTO_MS = 2000

interface ICarouselProps {
	slides: TCarouselSlide[]
	autoMs?: number
}

export function Carousel({ slides, autoMs = AUTO_MS }: ICarouselProps) {
	const [paused, setPaused] = useState(false)
	const [transitionEnabled, setTransitionEnabled] = useState(true)

	const [stepPx, setStepPx] = useState(0)
	const [cloneCount, setCloneCount] = useState(1)
	const [index, setIndex] = useState(0)

	const isAnimatingRef = useRef(false)

	const viewportRef = useRef<HTMLDivElement | null>(null)
	const trackRef = useRef<HTMLDivElement | null>(null)
	const itemRef = useRef<HTMLDivElement | null>(null)
	const rafRef = useRef<number | null>(null)

	const enableTransitionNextFrame = useCallback(() => {
		if (rafRef.current) cancelAnimationFrame(rafRef.current)
		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = requestAnimationFrame(() =>
				setTransitionEnabled(true),
			)
		})
	}, [])

	useEffect(() => {
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
		}
	}, [])

	useLayoutEffect(() => {
		const compute = () => {
			if (!viewportRef.current || !trackRef.current || !itemRef.current)
				return

			const itemW = itemRef.current.getBoundingClientRect().width
			const styles = getComputedStyle(trackRef.current)
			const gap = parseFloat(styles.gap || styles.columnGap || "0") || 0
			const step = itemW + gap
			if (!step) return

			const viewportW = viewportRef.current.getBoundingClientRect().width
			const visible = Math.ceil(viewportW / step) + 1 // +1 buffer prevents whitespace

			setStepPx(step)
			setCloneCount(Math.max(1, visible))
		}

		compute()

		let ro: ResizeObserver | null = null
		if (typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(compute)
			if (viewportRef.current) ro.observe(viewportRef.current)
			if (trackRef.current) ro.observe(trackRef.current)
			if (itemRef.current) ro.observe(itemRef.current)
		}

		window.addEventListener("resize", compute)
		return () => {
			window.removeEventListener("resize", compute)
			ro?.disconnect()
		}
	}, [])

	useEffect(() => {
		setTransitionEnabled(false)
		setIndex(cloneCount)
		enableTransitionNextFrame()
	}, [cloneCount, enableTransitionNextFrame])

	const trackSlides = useMemo(() => {
		const total = slides.length + 2 * cloneCount
		const wrap = (n: number, mod: number) => ((n % mod) + mod) % mod

		return Array.from({ length: total }, (_, j) => {
			const realIdx = wrap(j - cloneCount, slides.length)
			return slides[realIdx]
		})
	}, [cloneCount, slides])

	const prev = useCallback(() => {
		if (isAnimatingRef.current) return

		setTransitionEnabled(true)
		setIndex((i) => i - 1)
	}, [])

	const next = useCallback(() => {
		if (isAnimatingRef.current) return

		setTransitionEnabled(true)
		setIndex((i) => i + 1)
	}, [])

	useEffect(() => {
		if (paused) return
		if (isAnimatingRef.current) return

		const t = window.setTimeout(() => {
			next()
		}, autoMs)

		return () => window.clearTimeout(t)
	}, [index, paused, next, autoMs])

	const onTransitionEnd = useCallback(() => {
		const startReal = cloneCount
		const endRealExclusive = cloneCount + slides.length

		let newIndex = index
		while (newIndex < startReal) newIndex += slides.length
		while (newIndex >= endRealExclusive) newIndex -= slides.length

		if (newIndex !== index) {
			setTransitionEnabled(false)
			setIndex(newIndex)
			enableTransitionNextFrame()
		}
	}, [index, cloneCount, enableTransitionNextFrame, slides.length])

	return (
		<XStack className="space-x-4 items-center max-w-7xl">
			{/* Left arrow */}
			<Flex
				role="button"
				aria-label="Previous"
				onClick={prev}
				className={cn(
					"p-3 items-center justify-center rounded-full cursor-pointer",
					"bg-[linear-gradient(135deg,var(--color-knockout)_40%,var(--color-primary)_90%)] hover:opacity-80",
				)}
			>
				<ArrowLeftIcon size={28} />
			</Flex>

			{/* Viewport */}
			<div
				ref={viewportRef}
				className={cn(
					"relative w-full overflow-hidden",
					paused ? "cursor-not-allowed" : "cursor-pointer",
				)}
				onMouseEnter={() => setPaused(true)}
				onMouseLeave={() => setPaused(false)}
			>
				<div
					className={cn(
						"pointer-events-none absolute top-3 right-3 z-10",
						"rounded-md px-2 py-1 text-xs",
						"bg-black/40 backdrop-blur border border-white/10",
						"transition-opacity",
						paused ? "opacity-100" : "opacity-0",
					)}
				>
					⏸ Carousel Paused
				</div>
				<XStack
					ref={trackRef}
					className="w-full items-center gap-12"
					style={{
						transform: `translate3d(${-stepPx * index}px, 0, 0)`,
						transition: transitionEnabled
							? "transform 420ms ease"
							: "none",
						willChange: "transform",
						opacity: stepPx ? 1 : 0,
					}}
					onTransitionEnd={onTransitionEnd}
				>
					{trackSlides.map((slide, j) => {
						if (!slide) return null
						return (
							<CarouselItem
								key={`${slide.type}-${slide.src}-${j}`}
								ref={j === cloneCount ? itemRef : undefined}
							>
								{slide.type === "video" ? (
									<video
										src={slide.src}
										autoPlay
										loop
										muted
										playsInline
										preload="auto"
										className="w-full h-auto object-cover rounded-lg"
									/>
								) : (
									<Image
										src={slide.src}
										alt={slide.alt}
										width={slide.width}
										height={slide.height}
										className="w-full h-auto object-cover rounded-lg"
									/>
								)}
							</CarouselItem>
						)
					})}
				</XStack>
			</div>

			{/* Right arrow */}
			<Flex
				role="button"
				aria-label="Next"
				onClick={next}
				className={cn(
					"p-3 items-center justify-center rounded-full cursor-pointer",
					"bg-[linear-gradient(135deg,var(--color-knockout)_40%,var(--color-primary)_90%)] hover:opacity-80",
				)}
			>
				<ArrowRightIcon size={28} />
			</Flex>
		</XStack>
	)
}

interface ICarouselItemProps {
	children: React.ReactNode
}

const CarouselItem = forwardRef<HTMLDivElement, ICarouselItemProps>(
	function CarouselItem({ children }, ref) {
		return (
			<Flex
				ref={ref}
				className={cn("shrink-0", "min-w-2xs max-w-2xs h-auto")}
			>
				{children}
			</Flex>
		)
	},
)
