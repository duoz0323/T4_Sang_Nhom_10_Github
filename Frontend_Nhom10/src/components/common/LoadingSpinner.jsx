import React from 'react';

const LoadingSpinner = ({ text = "Đang tải dữ liệu...", fullPage = false }) => {
    const spinnerContent = (
        <div className="text-center py-12 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-teal-600 mb-4">autorenew</span>
            <p className="text-slate-500 font-medium">{text}</p>
        </div>
    );

    if (fullPage) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                {spinnerContent}
            </div>
        );
    }

    return spinnerContent;
};

export default LoadingSpinner;
