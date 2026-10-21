export function DeclarativeArchitecturePage() {
  return (
    <section className="page-shell">
      <header className="page-header">
        <span className="stub-badge">АКАДЕМИЧЕСКАЯ БАЗА ДИПЛОМНОГО ПРОЕКТА</span>
        <h1 className="page-title">
          Декларативный движок правил (Specification Pattern & AST Expression Trees)
        </h1>
        <p className="page-lead">
          Вся фильтрация и скоринг кандидатов построены в строго декларативной парадигме без
          императивных циклов (<code>for</code>, <code>foreach</code>) и каскадов{' '}
          <code>if-else</code>.
        </p>
      </header>

      <div className="detail-grid">
        <div className="detail-card">
          <h2>1. Предикаты выражений (AST &rarr; SQL)</h2>
          <p className="page-muted">
            Каждое правило наследует <code>Specification&lt;UserAccount&gt;</code> и возвращает
            чистое дерево выражений <code>Expression&lt;Func&lt;UserAccount, bool&gt;&gt;</code>,
            которое напрямую транслируется Entity Framework Core в SQL-запрос{' '}
            <code>WHERE ...</code>.
          </p>
        </div>

        <div className="detail-card">
          <h2>2. Алгебраическая композиция правил</h2>
          <p className="page-muted">
            Операторы <code>.And()</code>, <code>.Or()</code> и <code>.Not()</code> объединяют
            поддеревья AST через <code>ExpressionVisitor (ParameterReplacerVisitor)</code>, а
            сборка итогового фильтра выполняется функциональной свёрткой{' '}
            <code>.Where().Select().Aggregate()</code> с нейтральным элементом{' '}
            <code>IdentitySpecification</code>.
          </p>
        </div>

        <div className="detail-card">
          <h2>3. Декларативный пайплайн скоринга</h2>
          <p className="page-muted">
            Ранжирование строится на неизменяемом реестре весовых чистых функций{' '}
            <code>DeclarativeScoringRule</code> (совпадение Вайба дня — 40 б., синхронность таймера
            — 20 б., гео-близость — 20 б., пересечение тегов — 20 б.) через сопоставление с образцом
            (pattern matching <code>switch</code> expressions) и LINQ-конвейер.
          </p>
        </div>
      </div>
    </section>
  )
}
