import styles from './selection-demo.module.scss'

import { PageWrapper } from '@/shared/widgets/page-wrapper'
import { ThemeToggle } from '@/shared/widgets/theme-toggle'

const SelectionDemoPage = () => {
	return (
		<PageWrapper>
			<div className={styles.header}>
				<h1>Демонстрация стилей выделения текста</h1>
				<ThemeToggle />
			</div>

			<div className={styles.section}>
				<h2>Обычное выделение текста</h2>
				<p>
					Это обычный параграф с текстом. Попробуйте выделить этот текст мышью - вы увидите красивые
					градиентные стили выделения, которые автоматически адаптируются к светлой и тёмной теме.
				</p>
			</div>

			<div className={styles.section}>
				<h2>Заголовки с особым выделением</h2>
				<h1>Заголовок H1 с градиентным выделением</h1>
				<h2>Заголовок H2 с синим градиентом</h2>
				<h3>Заголовок H3 с оранжевым градиентом</h3>
				<h4>Заголовок H4 с базовым выделением</h4>
			</div>

			<div className={styles.section}>
				<h2>Ссылки и кнопки</h2>
				<p>
					Это <a href='#'>ссылка с особым выделением</a> и <button className={styles.button}>кнопка</button>.
				</p>
				<button>Обычная кнопка с выделением</button>
			</div>

			<div className={styles.section}>
				<h2>Код и технический текст</h2>
				<p>
					Вот пример <code>inline кода</code> с выделением и блок кода:
				</p>
				<pre>
					{`function highlightText() {
  return "Красивое выделение!";
}`}
				</pre>
			</div>

			<div className={styles.section}>
				<h2>Выделение с эффектами</h2>
				<p>
					Этот текст имеет <span className={styles.highlightText}>эффект подсветки при наведении</span>.
				</p>
				<p>
					Этот текст имеет <span className={styles.selectionGlow}>эффект свечения при выделении</span>.
				</p>
				<p>
					Этот текст <mark>выделен маркером</mark> с красивым градиентом.
				</p>
			</div>

			<div className={styles.section}>
				<h2>Специальные классы</h2>
				<p className={styles.textSelectable}>
					Этот текст специально предназначен для выделения с улучшенными стилями.
				</p>
			</div>

			<div className={styles.section}>
				<h2>Адаптивность</h2>
				<p>
					Все стили выделения автоматически адаптируются к светлой и тёмной теме. В светлой теме используется
					синий градиент, а в тёмной - оранжевый. Цвета текста и теней также меняются для оптимальной
					читаемости.
				</p>
			</div>
		</PageWrapper>
	)
}

export const Component = SelectionDemoPage
