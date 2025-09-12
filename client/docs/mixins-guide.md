# Руководство по миксинам

Миксины - это переиспользуемые блоки SCSS кода, которые помогают быстро создавать стили. В проекте все миксины находятся в `shared/styles/mixins/`.

## Импорт миксинов

```scss
@use '@/shared/styles/mixins' as *;
```

## Брейкпоинты

### Основные миксины

```scss
// Мобильные устройства (до 480px)
@include mobile {
	font-size: 0.9rem;
}

// Планшеты (480px - 1024px)
@include tablet {
	font-size: 1rem;
}

// Десктоп (от 1024px)
@include desktop {
	font-size: 1.1rem;
}
```

### Дополнительные миксины

```scss
// От мобильных и выше
@include mobile-up {
	display: flex;
}

// От планшетов и выше
@include tablet-up {
	grid-template-columns: repeat(2, 1fr);
}

// От десктопа и выше
@include desktop-up {
	grid-template-columns: repeat(3, 1fr);
}

// До мобильных
@include mobile-down {
	display: block;
}

// До планшетов
@include tablet-down {
	flex-direction: column;
}

// До десктопа
@include desktop-down {
	padding: 1rem;
}
```

### Точные брейкпоинты

```scss
// Конкретный размер
@include breakpoint('sm') {
	font-size: 0.9rem;
}

@include breakpoint('md') {
	font-size: 1rem;
}

@include breakpoint('lg') {
	font-size: 1.1rem;
}

// От конкретного размера
@include breakpoint-up('md') {
	display: grid;
}

// До конкретного размера
@include breakpoint-down('lg') {
	display: flex;
}

// Диапазон
@include between(600px, 900px) {
	background: blue;
}
```

## Типографика

### Заголовки

```scss
.my-title {
	@include font-display; // 3.5rem - очень крупный заголовок
}

.my-h1 {
	@include font-heading-1; // 2.5rem - h1
}

.my-h2 {
	@include font-heading-2; // 2rem - h2
}

.my-h3 {
	@include font-heading-3; // 1.5rem - h3
}
```

### Текст

```scss
.large-text {
	@include font-body-large; // 1.25rem - крупный текст
}

.body-text {
	@include font-body; // 1rem - обычный текст
}

.small-text {
	@include font-body-small; // 0.875rem - мелкий текст
}

.caption-text {
	@include font-caption; // 0.75rem - подписи
}
```

### Специальные

```scss
.button-text {
	@include font-button; // 0.875rem - текст кнопок
}

.label-text {
	@include font-label; // 0.875rem - метки
}
```

## Отступы

### Базовые миксины

```scss
// Margin
@include m(sm, all); // margin: 0.5rem
@include m(md, top); // margin-top: 1rem
@include m(lg, x); // margin-left + margin-right: 1.5rem
@include m(xl, y); // margin-top + margin-bottom: 2rem

// Padding
@include p(sm, all); // padding: 0.5rem
@include p(md, bottom); // padding-bottom: 1rem
@include p(lg, horizontal); // padding-left + padding-right: 1.5rem

// Gap
@include g(md); // gap: 1rem
```

### Стороны отступов

```scss
// Все стороны
@include m(lg, all);
@include p(md, all);

// Конкретные стороны
@include m(sm, top); // margin-top
@include m(sm, right); // margin-right
@include m(sm, bottom); // margin-bottom
@include m(sm, left); // margin-left

// Краткие названия
@include m(sm, t); // margin-top
@include m(sm, r); // margin-right
@include m(sm, b); // margin-bottom
@include m(sm, l); // margin-left

// Оси
@include m(md, x); // margin-left + margin-right
@include m(md, horizontal); // margin-left + margin-right
@include m(md, y); // margin-top + margin-bottom
@include m(md, vertical); // margin-top + margin-bottom
```

## Макет

### Flexbox

```scss
.flex-container {
	@include flex-center; // Центрирование по всем осям
	@include flex-between; // justify-content: space-between
	@include flex-column; // flex-direction: column
}
```

### Grid

```scss
.grid-container {
	@include grid-responsive(1, 2, 3); // 1 колонка на мобильном, 2 на планшете, 3 на десктопе
	@include g(md); // gap: 1rem
}
```

### Контейнер

```scss
.page-container {
	@include container; // Центрированный контейнер с адаптивными отступами
}
```

## Примеры использования

### Адаптивная сетка

```scss
.products-grid {
	@include grid-responsive(1, 2, 3);
	@include g(md);

	@include tablet {
		@include g(lg);
	}

	@include mobile {
		@include g(sm);
	}
}
```

### Кнопка с иконкой

```scss
.icon-button {
	@include button-base;
	@include flex-center;
	@include size-variants('button');
	@include button-variant($primary_color);

	.icon {
		@include square(20px);
	}
}
```

### Форма

```scss
.form-container {
	@include container;
	@include p(lg, all);

	.form {
		@include flex-column;
		@include g(md);
	}

	.field {
		@include flex-column;
		@include g(xs);
	}

	.label {
		@include font-label;
		color: $text_color;
	}

	.input {
		@include p(sm, all);
		border: 1px solid $border_color;
		border-radius: 0.375rem;
		background: $background_card;
		color: $text_color;
		@include font-body;

		&:focus {
			outline: none;
			border-color: $primary_color;
		}
	}
}
```
