import React, { useState, useEffect } from 'react';

const StatCard = ({ label, value, prefix = "", suffix = "", color = "var(--text-main)", growth = null }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;

        let totalDuration = 1000;
        let increment = end / (totalDuration / 16);

        let timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="glass-morphism" style={{
            padding: '12px 16px',
            border: '1px solid var(--glass-border)',
            background: 'var(--card-bg)',
        }}>
            <p style={{
                color: 'var(--text-main)',
                opacity: 0.9,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                fontWeight: '600',
                marginBottom: '2px'
            }}>{label}</p>
            <h2 style={{ fontSize: '1.4rem', margin: '2px 0', color: color }}>
                {prefix}{displayValue.toLocaleString()}{suffix}
            </h2>
            {growth !== null && (
                <span style={{ color: growth >= 0 ? '#4caf50' : '#ff4d4d', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% this month
                </span>
            )}
        </div>
    );
};

export default StatCard;
