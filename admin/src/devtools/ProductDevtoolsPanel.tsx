import { productDevtoolsSnapshot } from './productSnapshot'

export function ProductDevtoolsPanel() {
  return (
    <section className="product-devtools-panel">
      <header>
        <span>{productDevtoolsSnapshot.environment}</span>
        <h2>{productDevtoolsSnapshot.app}</h2>
        <p>Product-specific panels stay small and read from a plain snapshot.</p>
      </header>

      <div className="devtools-section-list">
        {productDevtoolsSnapshot.sections.map((section) => (
          <article className="devtools-section-row" key={section.label}>
            <div>
              <strong>{section.label}</strong>
              <p>{section.detail}</p>
            </div>
            <code>{section.value}</code>
          </article>
        ))}
      </div>
    </section>
  )
}
