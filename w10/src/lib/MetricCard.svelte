<script>
  // Props make this metric card reusable across different KPIs.
  let { title, value, detail, tone = 'neutral' } = $props()
</script>

<!-- Compact summary card used in the metrics strip. -->
<article class={`metric-card ${tone}`}>
  <p>{title}</p>
  <h3>{value}</h3>
  <small>{detail}</small>
</article>

<style>
  /* Shared card layout + typography. */
  .metric-card {
    padding: 1rem;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(44, 44, 44, 0.88);
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.3);
  }

  p,
  h3,
  small {
    margin: 0;
  }

  p {
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #888888;
  }

  h3 {
    margin-top: 0.45rem;
    font-size: 2rem;
    font-family: 'Space Grotesk', sans-serif;
    color: #f6f6f6;
  }

  small {
    display: block;
    margin-top: 0.45rem;
    color: #888888;
  }

  /* Tone modifiers provide subtle visual grouping for each metric type. */
  .neutral {
    background: rgba(44, 44, 44, 0.9);
  }

  .warm {
    background: linear-gradient(180deg, rgba(255, 62, 0, 0.12), rgba(44, 44, 44, 0.9));
  }

  .cool {
    background: linear-gradient(180deg, rgba(255, 100, 60, 0.08), rgba(44, 44, 44, 0.9));
  }

  .accent {
    background: linear-gradient(180deg, rgba(255, 62, 0, 0.2), rgba(44, 44, 44, 0.9));
  }
</style>