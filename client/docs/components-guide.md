# Руководство по компонентам

## Структура компонентов

Все компоненты организованы в две папки:

- **`shared/kit/`** - базовые переиспользуемые компоненты
- **`shared/ui/`** - сложные UI компоненты и макеты

Каждый компонент находится в отдельной папке с файлами:

- `index.tsx` - основной компонент
- `component.module.scss` - стили компонента
- `types.ts` - типы (если нужны)

## Kit компоненты (базовые)

### Button

Универсальная кнопка с поддержкой разных вариантов и размеров.

```tsx
import { Button } from '@/shared/kit/button'

// Базовое использование
<Button>Нажми меня</Button>

// С вариантами
<Button variant="success">Успех</Button>
<Button variant="error">Ошибка</Button>
<Button variant="warning">Предупреждение</Button>
<Button variant="info">Информация</Button>
<Button variant="text">Текстовая кнопка</Button>
<Button variant="link">Ссылка</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="md">Средняя</Button>
<Button size="lg">Большая</Button>

// Ширина
<Button width="full">На всю ширину</Button>
<Button width="fit">По содержимому</Button>
<Button width="half">Половина</Button>

// Как ссылка
<Button href="/profile">Перейти в профиль</Button>

// С дополнительными пропсами
<Button
  variant="success"
  size="lg"
  width="full"
  onClick={() => console.log('clicked')}
  disabled
>
  Отправить
</Button>
```

**Доступные варианты:**

- `default` - стандартная кнопка
- `success` - зеленая (успех)
- `error` - красная (ошибка)
- `warning` - оранжевая (предупреждение)
- `info` - синяя (информация)
- `text` - текстовая кнопка
- `link` - кнопка-ссылка
- `enabled` - включена (зеленая)
- `disabled` - отключена (красная)
- `loading` - загрузка (желтая)

### Card

Карточка для группировки контента.

```tsx
import { Card } from '@/shared/kit/card'

// Базовое использование
<Card>
  <p>Содержимое карточки</p>
</Card>

// С заголовком
<Card title="Заголовок карточки">
  <p>Содержимое</p>
</Card>

// Варианты
<Card variant="outlined">Контурная</Card>
<Card variant="filled">Залитая</Card>
<Card variant="elevated">С тенью</Card>
<Card variant="plain">Простая</Card>

// Размеры
<Card size="sm">Маленькая</Card>
<Card size="md">Средняя</Card>
<Card size="lg">Большая</Card>

// Ширина
<Card width="full">На всю ширину</Card>
<Card width="half">Половина</Card>
<Card width="third">Треть</Card>
<Card width="quarter">Четверть</Card>

// Фоны
<Card background="light">Светлый фон</Card>
<Card background="primary">Основной цвет</Card>
<Card background="success">Успех</Card>

// Интерактивная карточка
<Card
  title="Кликни меня"
  onClick={() => console.log('clicked')}
  clickable
>
  Содержимое
</Card>

// Отключенная карточка
<Card disabled>
  Недоступна
</Card>
```

### Icon

Компонент для отображения иконок.

```tsx
import { Icon } from '@/shared/kit/icon'

// Базовое использование
<Icon name="success" />
<Icon name="error" />
<Icon name="warning" />
<Icon name="info" />
<Icon name="loading" />
<Icon name="close" />

// С дополнительными классами
<Icon name="loading" className="spinning" />
```

**Доступные иконки:**

- `success` - галочка (зеленая)
- `error` - крестик (красная)
- `warning` - восклицание (оранжевая)
- `info` - информация (синяя)
- `loading` - загрузка (вращающаяся)
- `close` - закрыть (серая)

### Loader

Индикатор загрузки.

```tsx
import { Loader } from '@/shared/kit/loader'

// Базовое использование
<Loader />

// Размеры
<Loader size="small" />
<Loader size="medium" />
<Loader size="large" />

// С дополнительными классами
<Loader size="large" className="my-loader" />
```

### PageLoader

Полноэкранный индикатор загрузки страницы.

```tsx
import { PageLoader } from '@/shared/kit/page-loader'

// Базовое использование
<PageLoader />

// С сообщением
<PageLoader message="Загружаем данные..." />

// С дополнительными классами
<PageLoader
  message="Пожалуйста, подождите"
  className="custom-loader"
/>
```

## UI компоненты (сложные)

### Toast

Система уведомлений.

```tsx
import { Toast } from '@/shared/ui/toast'

// Базовое уведомление
<Toast
  id="toast-1"
  title="Успех!"
  description="Операция выполнена успешно"
  type="success"
  onClose={(id) => console.log('close', id)}
/>

// Разные типы
<Toast id="error-1" type="error" title="Ошибка!" onClose={handleClose} />
<Toast id="warning-1" type="warning" title="Внимание!" onClose={handleClose} />
<Toast id="info-1" type="info" title="Информация" onClose={handleClose} />
<Toast id="loading-1" type="loading" title="Загрузка..." onClose={handleClose} />

// С действием
<Toast
  id="action-1"
  title="Файл удален"
  description="Файл был перемещен в корзину"
  type="success"
  action={{
    label: "Отменить",
    onClick: () => console.log("undo")
  }}
  onClose={handleClose}
/>

// Настройки
<Toast
  id="custom-1"
  title="Настройки"
  type="info"
  duration={10000}  // 10 секунд
  closable={false}  // нельзя закрыть
  onClose={handleClose}
/>
```

**Параметры:**

- `id` - уникальный идентификатор
- `title` - заголовок (опционально)
- `description` - описание (опционально)
- `type` - тип: `success`, `error`, `warning`, `info`, `loading`
- `duration` - длительность показа в мс (по умолчанию 5000)
- `closable` - можно ли закрыть (по умолчанию true)
- `action` - кнопка действия (опционально)
- `onClose` - обработчик закрытия

### Layout

Основной макет приложения с анимациями переходов.

```tsx
import { Layout } from '@/shared/ui/layout'

// В роутере
;<Routes>
	<Route path='/' element={<Layout />}>
		<Route index element={<HomePage />} />
		<Route path='profile' element={<ProfilePage />} />
	</Route>
</Routes>
```

**Особенности:**

- Автоматические анимации переходов между страницами
- Поддержка отключения анимаций через Redux store
- Использует Framer Motion для плавных переходов

### PageWrapper

Обертка для страниц с контейнером.

```tsx
import { PageWrapper } from '@/shared/ui/page-wrapper'

export function MyPage() {
	return (
		<PageWrapper>
			<h1>Заголовок страницы</h1>
			<p>Содержимое страницы</p>
		</PageWrapper>
	)
}

// С дополнительными классами
;<PageWrapper className='my-page'>
	<div>Контент</div>
</PageWrapper>
```

### ErrorBoundary

Обработка ошибок с красивым интерфейсом.

```tsx
import { ErrorBoundaryContent } from '@/shared/ui/error-boundary'

// В ErrorBoundary компоненте
;<ErrorBoundaryContent
	error={error}
	onReload={() => window.location.reload()}
	onGoHome={() => navigate('/')}
	onOpenEditor={() => openInEditor(error)}
/>
```

**Функции:**

- Показ информации об ошибке
- Кнопка перезагрузки страницы
- Кнопка перехода на главную
- Открытие стека ошибок в редакторе
- Адаптивный дизайн

## Импорт компонентов

### Из kit

```tsx
import { Button, Card, Icon, Loader, PageLoader } from '@/shared/kit'
```

### Из ui

```tsx
import { Toast } from '@/shared/ui/toast'
import { Layout } from '@/shared/ui/layout'
import { PageWrapper } from '@/shared/ui/page-wrapper'
import { ErrorBoundaryContent } from '@/shared/ui/error-boundary'
```

## Создание новых компонентов

### Структура папки

```
shared/kit/my-component/
├── index.tsx              # Основной компонент
├── my-component.module.scss # Стили
└── types.ts               # Типы (если нужны)
```

### Пример компонента

```tsx
// index.tsx
import styles from './my-component.module.scss'
import clsx from 'clsx'

interface MyComponentProps {
	title: string
	variant?: 'primary' | 'secondary'
	className?: string
}

export function MyComponent({ title, variant = 'primary', className }: MyComponentProps) {
	return (
		<div className={clsx(styles.component, styles[variant], className)}>
			<h3>{title}</h3>
		</div>
	)
}
```

```scss
// my-component.module.scss
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;

.component {
	@include card-base;

	&.primary {
		background: $primary_color;
		color: white;
	}

	&.secondary {
		background: $secondary_color;
		color: $text_color;
	}
}
```

### Экспорт в index.ts

```tsx
// shared/kit/index.ts
export { Button } from './button'
export { Card } from './card'
export { Icon } from './icon'
export { Loader } from './loader'
export { PageLoader } from './page-loader'
export { MyComponent } from './my-component' // Добавить новый
```
