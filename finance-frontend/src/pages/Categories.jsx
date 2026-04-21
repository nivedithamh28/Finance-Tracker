import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../api/categories';
import './Categories.css';

export default function Categories() {
    return (
        <div className="cat-container">
            <header className="cat-header">
                <h1 className="cat-title">Transaction Categories</h1>
                <p className="cat-subtitle">Explore the categories used to organize your finances</p>
            </header>

            <div className="cat-grid">
                {/* Expense Categories */}
                <section className="cat-card">
                    <h2 className="cat-card-title expense">Expense Categories</h2>
                    <div className="cat-list">
                        {EXPENSE_CATEGORIES.map(cat => (
                            <div key={cat.value} className="cat-item">
                                <span className="cat-icon">{cat.icon}</span>
                                <div className="cat-info">
                                    <span className="cat-label">{cat.label}</span>
                                    <span className="cat-value">{cat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Income Categories */}
                <section className="cat-card">
                    <h2 className="cat-card-title income">Income Categories</h2>
                    <div className="cat-list">
                        {INCOME_CATEGORIES.map(cat => (
                            <div key={cat.value} className="cat-item">
                                <span className="cat-icon">{cat.icon}</span>
                                <div className="cat-info">
                                    <span className="cat-label">{cat.label}</span>
                                    <span className="cat-value">{cat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
