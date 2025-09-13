export enum JobStatus {
	ACTIVE = 'active',
	PAUSED = 'paused',
	CLOSED = 'closed',
	EXPIRED = 'expired'
}

export enum NotificationType {
	SUCCESS = 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info'
}

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc'
}

export enum SortField {
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
	TITLE = 'title',
	SALARY = 'salary',
	COMPANY = 'company'
}

export enum LoadingState {
	IDLE = 'idle',
	LOADING = 'loading',
	SUCCESS = 'success',
	ERROR = 'error'
}

export enum ModalType {
	CONFIRM = 'confirm',
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error'
}

export enum Theme {
	LIGHT = 'light',
	DARK = 'dark',
	AUTO = 'auto'
}

export enum UserRole {
	USER = 'user',
	ADMIN = 'admin',
	MODERATOR = 'moderator'
}

export enum EmploymentType {
	FULL_TIME = 'full-time',
	PART_TIME = 'part-time',
	CONTRACT = 'contract',
	INTERNSHIP = 'internship'
}

export enum ExperienceLevel {
	JUNIOR = 'junior',
	MIDDLE = 'middle',
	SENIOR = 'senior',
	LEAD = 'lead'
}
