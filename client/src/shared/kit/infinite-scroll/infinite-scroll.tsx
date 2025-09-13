import styles from './infinite-scroll.module.scss'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { Loader } from '@/shared/kit'

interface InfiniteScrollProps<T> {
	items: T[]
	hasNextPage: boolean
	isLoading: boolean
	isFetchingNextPage?: boolean
	error: string | null
	onLoadMore: () => void
	renderItem: (item: T, index: number) => ReactNode
	loadingComponent?: ReactNode
	errorComponent?: ReactNode
	emptyComponent?: ReactNode
	errorMessage?: string
	emptyMessage?: string
	className?: string
}

export const InfiniteScroll = <T,>({
	items,
	hasNextPage,
	isLoading,
	isFetchingNextPage = false,
	error,
	onLoadMore,
	renderItem,
	loadingComponent,
	errorComponent,
	emptyComponent,
	errorMessage,
	emptyMessage,
	className
}: InfiniteScrollProps<T>) => {
	const [isIntersecting, setIsIntersecting] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const hasTriggeredRef = useRef(false)
	const onLoadMoreRef = useRef(onLoadMore)

	const handleIntersection = useCallback(([entry]: IntersectionObserverEntry[]) => {
		setIsIntersecting(entry.isIntersecting)
	}, [])

	useEffect(() => {
		onLoadMoreRef.current = onLoadMore
	}, [onLoadMore])

	useEffect(() => {
		const element = ref.current
		if (!element || !hasNextPage) return

		const observer = new IntersectionObserver(handleIntersection, {
			threshold: 0,
			rootMargin: '100px'
		})

		observer.observe(element)

		return () => {
			observer.unobserve(element)
		}
	}, [hasNextPage, handleIntersection])

	useEffect(() => {
		if (isIntersecting && hasNextPage && !isFetchingNextPage && !error && !hasTriggeredRef.current) {
			hasTriggeredRef.current = true
			onLoadMoreRef.current()
		}
	}, [isIntersecting, hasNextPage, isFetchingNextPage, error])

	useEffect(() => {
		if (!isIntersecting) {
			hasTriggeredRef.current = false
		}
	}, [isIntersecting])

	if (error) {
		return (
			<div className={className}>
				{items.length > 0 && items.map(renderItem)}
				{errorComponent || (
					<div className={styles.errorMessage}>
						<h3>{errorMessage || 'Ошибка загрузки'}</h3>
						<p>{error}</p>
					</div>
				)}
			</div>
		)
	}

	if (items.length === 0 && !isLoading) {
		return (
			<div className={className}>
				{emptyComponent || (
					<div className={styles.emptyState}>
						<h3>{emptyMessage || 'Нет данных'}</h3>
						<p>Попробуйте обновить страницу</p>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className={className}>
			{items.map(renderItem)}

			{hasNextPage && (
				<div ref={ref} className={styles.loadingTrigger}>
					{isFetchingNextPage ? loadingComponent || <Loader size='small' /> : null}
				</div>
			)}
		</div>
	)
}
