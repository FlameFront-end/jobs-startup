# Руководство по стилям

## Переменные

### CSS переменные (темы)

Проект поддерживает светлую и темную темы через CSS переменные:

```scss
:root {
	--primary-color: #2563eb;
	--secondary-color: #1e293b;
	--accent-color: #f59e0b;
	--text-color: #0f172a;
	--text-light: #64748b;
	--background-color: #fff;
	--background-light: #f8fafc;
	--background-card: #fff;
	--border-color: #e2e8f0;
	--error-color: #dc2626;
	--success-color: #059669;
	--warning-color: #d97706;
	--selection-bg: #3b82f6;
	--selection-color: #fff;
}

[data-theme='dark'] {
	--primary-color: #3b82f6;
	--secondary-color: #1f2937;
	--accent-color: #fbbf24;
	--text-color: #f1f5f9;
	--text-light: #94a3b8;
	--background-color: #0f172a;
	--background-light: #1e293b;
	--background-card: #1e293b;
	--border-color: #334155;
	--error-color: #ef4444;
	--success-color: #10b981;
	--warning-color: #f59e0b;
	--selection-bg: #fbbf24;
	--selection-color: #0f172a;
}
```

### SCSS переменные

Для удобства работы в SCSS есть переменные-алиасы:

```scss
$primary_color: var(--primary-color);
$secondary_color: var(--secondary-color);
$accent_color: var(--accent-color);
$text_color: var(--text-color);
$text_light: var(--text-light);
$background_color: var(--background-color);
$background_light: var(--background-light);
$background_card: var(--background-card);
$border_color: var(--border-color);
$error_color: var(--error-color);
$success_color: var(--success-color);
$warning_color: var(--warning-color);
$selection_bg: var(--selection-bg);
$selection_color: var(--selection-color);
```

### Брейкпоинты

```scss
$breakpoints: (
	sm: 480px,
	// mobile
	md: 768px,
	// tablet
	lg: 1024px,
	// desktop
	xl: 1280px,
	2xl: 1536px
);
```

### Отступы

```scss
$spacing: (
	xs: 0.25rem,
	// 4px
	sm: 0.5rem,
	// 8px
	md: 1rem,
	// 16px
	lg: 1.5rem,
	// 24px
	xl: 2rem,
	// 32px
	2xl: 3rem // 48px
);
```

### Радиусы скругления

```scss
$border_radius: (
	sm: 0.25rem,
	// 4px
	md: 0.375rem,
	// 6px
	lg: 0.5rem,
	// 8px
	xl: 0.75rem,
	// 12px
	full: 9999px // полное скругление
);
```

## Использование переменных

### В CSS

```scss
.my-component {
	color: var(--text-color);
	background: var(--background-card);
	border: 1px solid var(--border-color);
}
```

### В SCSS

```scss
@use '@/shared/styles/variables' as *;

.my-component {
	color: $text_color;
	background: $background_card;
	border: 1px solid $border_color;
}
```

## Адаптивность

Проект использует три основных брейкпоинта:

- **Mobile** - до 480px
- **Tablet** - от 480px до 1024px
- **Desktop** - от 1024px и выше

### Миксины для адаптивности

```scss
@use '@/shared/styles/mixins' as *;

.my-component {
	font-size: 1rem;

	@include tablet {
		font-size: 1.125rem;
	}

	@include desktop {
		font-size: 1.25rem;
	}
}
```

## Типографика

### Базовые стили

Все заголовки и текст имеют базовые стили в `_base.scss`:

```scss
h1 {
	@include font-heading-1;
}
h2 {
	@include font-heading-2;
}
h3 {
	@include font-heading-3;
}
p {
	@include font-body;
}
```

### Миксины типографики

```scss
@include font-display; // 3.5rem, очень крупный заголовок
@include font-heading-1; // 2.5rem, h1
@include font-heading-2; // 2rem, h2
@include font-heading-3; // 1.5rem, h3
@include font-body-large; // 1.25rem, крупный текст
@include font-body; // 1rem, обычный текст
@include font-body-small; // 0.875rem, мелкий текст
@include font-caption; // 0.75rem, подписи
@include font-button; // 0.875rem, кнопки
@include font-label; // 0.875rem, метки
```

## Цветовая схема

### Основные цвета

- **Primary** - основной цвет бренда (#2563eb)
- **Secondary** - вторичный цвет (#1e293b)
- **Accent** - акцентный цвет (#f59e0b)

### Семантические цвета

- **Success** - успех (#059669)
- **Error** - ошибка (#dc2626)
- **Warning** - предупреждение (#d97706)

### Фоновые цвета

- **Background** - основной фон
- **Background Light** - светлый фон
- **Background Card** - фон карточек

## CSS Modules

Все компоненты используют CSS Modules для изоляции стилей:

```tsx
import styles from './component.module.scss'

export function Component() {
	return <div className={styles.container}>Content</div>
}
```

### Условные классы с clsx

```tsx
import clsx from 'clsx'

export function Component({ variant, disabled }) {
	return <div className={clsx(styles.component, styles[variant], { [styles.disabled]: disabled })}>Content</div>
}
```

## Импорты стилей

### Порядок импортов

1. Стили (SCSS файлы)
2. Пустая строка
3. React и библиотеки
4. Пустая строка
5. Локальные файлы проекта

```tsx
import styles from './component.module.scss'

import { useState } from 'react'
import clsx from 'clsx'

import { Button } from '@/shared/kit/button'
import { useTheme } from '@/shared/lib/hooks/useTheme'
```
