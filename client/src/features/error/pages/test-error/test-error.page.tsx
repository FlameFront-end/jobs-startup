import styles from './test-error.page.module.scss'

import { useState } from 'react'

const TestErrorPage = () => {
	const [shouldThrow, setShouldThrow] = useState(false)

	if (shouldThrow) {
		throw new Error('Тестовая ошибка для демонстрации ErrorBoundary!')
	}

	return (
		<div className={styles.testErrorPage}>
			<div className={styles.testContainer}>
				<h1>Тестовая страница ошибки</h1>
				<p>Нажмите кнопку ниже, чтобы вызвать ошибку и протестировать ErrorBoundary:</p>
				<button className={styles.btnDanger} onClick={() => setShouldThrow(true)}>
					Вызвать ошибку
				</button>
			</div>
		</div>
	)
}

export const Component = TestErrorPage
