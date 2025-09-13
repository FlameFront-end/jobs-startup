export interface Post {
	id: number
	title: string
	body: string
	userId: number
}

export interface PostsResponse {
	posts: Post[]
	page: number
	limit: number
	hasNextPage: boolean
}

export const fetchPosts = async (page: number = 1, limit: number = 10): Promise<PostsResponse> => {
	const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`)

	if (!response.ok) {
		throw new Error('Ошибка загрузки постов')
	}

	const posts: Post[] = await response.json()
	const hasNextPage = posts.length === limit

	return {
		posts,
		page,
		limit,
		hasNextPage
	}
}
