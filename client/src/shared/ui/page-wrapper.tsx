interface PageWrapperProps {
	children: React.ReactNode
	className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
	return (
		<div
			className={className}
			style={{
				width: '100%',
				height: '100vh',
				overflow: 'auto',
				position: 'relative'
			}}
		>
			{children}
		</div>
	)
}
