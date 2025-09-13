import { useCallback } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchPosts, type Post } from './posts.api'

export const useInfinitePosts = (limit: number = 10) => {
	return useInfiniteQuery({
		queryKey: ['posts', limit],
		queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam, limit),
		getNextPageParam: lastPage => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
		initialPageParam: 1,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000
	})
}

export const useInfinitePostsData = (limit: number = 10) => {
	const query = useInfinitePosts(limit)

	const posts: Post[] = query.data?.pages.flatMap(page => page.posts) ?? []
	const hasNextPage = query.hasNextPage
	const isLoading = query.isLoading
	const isFetchingNextPage = query.isFetchingNextPage
	const error = query.error?.message ?? null

	const loadMore = useCallback(() => {
		query.fetchNextPage()
	}, [query])

	return {
		posts,
		hasNextPage,
		isLoading: isLoading || isFetchingNextPage,
		isFetchingNextPage,
		error,
		loadMore,
		refetch: query.refetch
	}
}
