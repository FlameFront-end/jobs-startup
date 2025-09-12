# Быстрый старт для новичка

## Что нужно знать перед началом

### Основы React

- Компоненты и пропсы
- Хуки (useState, useEffect)
- Обработка событий
- Условный рендеринг

### Основы CSS

- Селекторы и свойства
- Flexbox и Grid
- Псевдоклассы (:hover, :focus)
- Медиа-запросы

### Основы TypeScript

- Типы и интерфейсы
- Пропсы компонентов
- События

## Первые шаги

### 1. Создание простого компонента

Создай папку для компонента:

```
src/features/my-feature/components/my-button/
├── index.tsx
└── my-button.module.scss
```

**index.tsx:**

```tsx
import styles from './my-button.module.scss'

interface MyButtonProps {
	children: string
	onClick?: () => void
	variant?: 'primary' | 'secondary'
}

export function MyButton({ children, onClick, variant = 'primary' }: MyButtonProps) {
	return (
		<button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
			{children}
		</button>
	)
}
```

**my-button.module.scss:**

```scss
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;

.button {
	@include button-base;
	@include font-button;

	&.primary {
		background: $primary_color;
		color: white;

		&:hover {
			background: $accent_color;
		}
	}

	&.secondary {
		background: $background_card;
		color: $text_color;
		border: 1px solid $border_color;

		&:hover {
			background: $background_light;
		}
	}
}
```

### 2. Использование готовых компонентов

```tsx
import { Button } from '@/shared/kit/button'
import { Card } from '@/shared/kit/card'

export function MyPage() {
	return (
		<Card title='Моя страница'>
			<p>Привет, мир!</p>
			<Button variant='primary' onClick={() => alert('Привет!')}>
				Нажми меня
			</Button>
		</Card>
	)
}
```

### 3. Стилизация с миксинами

```scss
.my-component {
	@include p(md, all); // padding: 1rem
	@include m(sm, bottom); // margin-bottom: 0.5rem
	@include flex-center; // display: flex, justify-content: center, align-items: center

	.title {
		@include font-heading-2; // стили для h2
		color: $primary_color;
	}

	.text {
		@include font-body; // стили для обычного текста
		color: $text_light;
	}
}
```

## Частые задачи

### Создание формы

```tsx
import { useState } from 'react'
import { Button } from '@/shared/kit/button'
import { Card } from '@/shared/kit/card'

export function ContactForm() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		console.log({ name, email })
	}

	return (
		<Card title='Связаться с нами'>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Имя:</label>
					<input type='text' value={name} onChange={e => setName(e.target.value)} />
				</div>

				<div>
					<label>Email:</label>
					<input type='email' value={email} onChange={e => setEmail(e.target.value)} />
				</div>

				<Button type='submit' variant='primary'>
					Отправить
				</Button>
			</form>
		</Card>
	)
}
```

### Создание списка

```tsx
interface Item {
	id: string
	name: string
	price: number
}

export function ItemList({ items }: { items: Item[] }) {
	return (
		<div className={styles.list}>
			{items.map(item => (
				<Card key={item.id} className={styles.item}>
					<h3>{item.name}</h3>
					<p>{item.price} ₽</p>
				</Card>
			))}
		</div>
	)
}
```

```scss
.list {
	@include grid-responsive(1, 2, 3);
	@include g(md);
}

.item {
	@include p(md, all);
}
```

### Адаптивность

```scss
.responsive-component {
	@include p(sm, all);

	@include tablet {
		@include p(md, all);
	}

	@include desktop {
		@include p(lg, all);
	}
}
```

## Полезные миксины для начала

### Отступы

```scss
@include p(sm, all); // padding: 0.5rem
@include m(md, bottom); // margin-bottom: 1rem
@include g(lg); // gap: 1.5rem
```

### Flexbox

```scss
@include flex-center; // центрирование
@include flex-between; // justify-content: space-between
@include flex-column; // flex-direction: column
```

### Типографика

```scss
@include font-heading-1; // стили для h1
@include font-body; // стили для обычного текста
@include font-button; // стили для кнопок
```

### Карточки

```scss
@include card-base; // базовые стили карточки
```

## Частые ошибки

### ❌ Неправильно

```tsx
// Не импортируй React целиком
import React from 'react'

// Не используй React.FC
const MyComponent: React.FC<Props> = ({ title }) => {
	return <div>{title}</div>
}
```

### ✅ Правильно

```tsx
// Импортируй только нужные хуки
import { useState } from 'react'

// Используй обычную функцию
function MyComponent({ title }: Props) {
	return <div>{title}</div>
}
```

### ❌ Неправильно

```scss
// Не используй обычные CSS классы
.my-component {
	.title {
		color: blue;
	}
}
```

### ✅ Правильно

```scss
// Используй CSS Modules
.my-component {
	.title {
		color: $primary_color;
	}
}
```

### ❌ Неправильно

```tsx
// Не используй обычные классы
<div className="my-class">
```

### ✅ Правильно

```tsx
// Используй CSS Modules
<div className={styles.myClass}>
```

## Полезные ссылки

- [Руководство по стилям](./styles-guide.md) - переменные и основы
- [Руководство по компонентам](./components-guide.md) - готовые компоненты
- [Руководство по миксинам](./mixins-guide.md) - все миксины

## Следующие шаги

1. Изучи [переменные стилей](./styles-guide.md#переменные)
2. Попробуй [готовые компоненты](./components-guide.md)
3. Изучи [миксины](./mixins-guide.md) для быстрой стилизации
4. Посмотри [примеры](./examples.md) для вдохновения
5. Создай свой первый компонент!

## Получение помощи

Если что-то не работает:

1. Проверь импорты
2. Убедись, что используешь CSS Modules
3. Проверь, что миксины импортированы
4. Посмотри на примеры в документации
5. Спроси у ментора
