import styles from './posts.module.scss'

import { Card } from '@/shared/kit'
import { InfiniteScroll } from '@/shared/kit/infinite-scroll'
import { PageWrapper } from '@/shared/widgets'

import { type Post } from '../../model/posts.api'
import { useInfinitePostsData } from '../../model/useInfinitePosts'

const PostCard = ({ post }: { post: Post }) => (
	<Card className={styles.postCard}>
		<h3 className={styles.postTitle}>{post.title}</h3>
		<p className={styles.postBody}>{post.body}</p>
		<div className={styles.postMeta}>
			<span className={styles.postId}>#{post.id}</span>
			<span className={styles.userId}>User {post.userId}</span>
		</div>
	</Card>
)

const PostsPage = () => {
	const { posts, hasNextPage, isLoading, isFetchingNextPage, error, loadMore } = useInfinitePostsData(10)

	const renderPost = (post: Post, _index: number) => <PostCard key={post.id} post={post} />

	return (
		<PageWrapper className={styles.container}>
			<h1 className={styles.title}>Posts with Infinite Scroll</h1>

			<InfiniteScroll
				items={posts}
				hasNextPage={hasNextPage}
				isLoading={isLoading}
				isFetchingNextPage={isFetchingNextPage}
				error={error}
				onLoadMore={loadMore}
				renderItem={renderPost}
				errorMessage='Не удалось загрузить посты'
				emptyMessage='Посты не найдены'
			/>
		</PageWrapper>
	)
}
export const Component = PostsPage
