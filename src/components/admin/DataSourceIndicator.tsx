interface DataSourceIndicatorProps {
  type: 'real' | 'simulated' | 'mixed'
  position?: 'top-right' | 'top-left' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  customText?: string
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({ 
  type, 
  position = 'top-right',
  size = 'sm',
  showIcon = true,
  customText
}) => {
  const getConfig = () => {
    switch (type) {
      case 'real':
        return {
          text: customText || 'REAL DATA',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: showIcon ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : null
        }
      case 'simulated':
        return {
          text: customText || 'SIMULATED DATA',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
          icon: showIcon ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : null
        }
      case 'mixed':
        return {
          text: customText || 'MIXED DATA',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: showIcon ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : null
        }
    }
  }

  const config = getConfig()
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const positionClasses = {
    'top-right': 'absolute top-2 right-2',
    'top-left': 'absolute top-2 left-2',
    'inline': ''
  }

  return (
    <div className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]} ${positionClasses[position]}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  )
}