export interface ParserConfig {
	name: string
	url: string
	keywords?: string[]
	type: 'static' | 'dynamic'
	selectors: {
		container: string
		title: string[]
		description: string[]
		link: string[]
	}
	baseUrl?: string
}

export const PARSER_CONFIGS: ParserConfig[] = [
	{
		name: 'HH.ru',
		url: 'https://hh.ru/search/vacancy?text=frontend+developer&area=1',
		keywords: ['frontend', 'react', 'vue', 'angular', 'javascript', 'typescript'],
		type: 'dynamic',
		baseUrl: 'https://hh.ru',
		selectors: {
			container: "[data-qa='vacancy-serp__vacancy']",
			title: [
				"[data-qa='vacancy-serp__vacancy-title'] a",
				'.vacancy-serp-item__title a',
				'.serp-item__title a',
				"a[data-qa*='title']"
			],
			description: [
				"[data-qa='vacancy-serp__vacancy-snippet']",
				'.vacancy-serp-item__snippet',
				'.serp-item__snippet',
				'.vacancy-item__snippet',
				"[data-qa*='snippet']"
			],
			link: ["a[href*='/vacancy/']", "a[data-qa*='title']"]
		}
	},
	{
		name: 'SuperJob',
		url: 'https://www.superjob.ru/vacancy/search/?keywords=frontend+developer&town=1',
		keywords: ['frontend', 'react', 'vue', 'angular', 'javascript', 'typescript'],
		type: 'dynamic',
		baseUrl: 'https://www.superjob.ru',
		selectors: {
			container: '.f-test-search-result-item',
			title: [
				'.f-test-link',
				'a[class*="f-test-link"]',
				'.vacancy-item__title a',
				'.search-result-item__title a'
			],
			description: [
				'.f-test-text',
				'.vacancy-item__description',
				'.search-result-item__description',
				'.vacancy-item__snippet',
				'[class*="description"]',
				'[class*="snippet"]'
			],
			link: ['a[href*="/vacancy/"]', '.f-test-link']
		}
	},
	{
		name: 'Habr Career',
		url: 'https://career.habr.com/vacancies?q=frontend+developer&type=all',
		keywords: ['frontend', 'react', 'vue', 'angular', 'javascript', 'typescript'],
		type: 'dynamic',
		baseUrl: 'https://career.habr.com',
		selectors: {
			container: '.vacancy-card',
			title: ['.vacancy-card__title a', '.vacancy-card__title-link', 'a[href*="/vacancies/"]'],
			description: [], // Для Habr получаем полное описание отдельно
			link: ['a[href*="/vacancies/"]', '.vacancy-card__title a']
		}
	}
]
