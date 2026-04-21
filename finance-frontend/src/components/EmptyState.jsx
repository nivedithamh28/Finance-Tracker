import React from 'react';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ""
}) => {
    return (
        <div className={`empty-state-container ${className}`}>
            <div className="empty-state-icon">
                {Icon ? <Icon /> : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                )}
            </div>
            <h3 className="empty-state-title">{title || "No data found"}</h3>
            <p className="empty-state-description">{description || "There's nothing to show here yet."}</p>
            {actionLabel && onAction && (
                <button className="empty-state-btn" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
