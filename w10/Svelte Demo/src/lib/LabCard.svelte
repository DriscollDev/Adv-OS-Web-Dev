<script>
  // Props: project data and callback passed from the parent board.
  let { lab, onAdvanceStatus } = $props()

  // Button label changes based on the current project status.
  const statusCopy = {
    Idea: 'Move to Building',
    Building: 'Mark Ready',
    'Ready to Demo': 'Reset to Idea'
  }
</script>

<!-- Project card renders one idea and emits status advancement events. -->
<article class="lab-card" data-status={lab.status}>
  <div class="card-top">
    <span class="track-chip">{lab.track}</span>
    <span class="week-chip">{lab.week} Weeks</span>
  </div>

  <div class="title-row">
    <h3>{lab.title}</h3>
    <span class="status-pill">{lab.status}</span>
  </div>

  <p class="summary">{lab.summary}</p>

  <div class="meta-row">
    <span>{lab.stack}</span>
  </div>

  <button type="button" onclick={() => onAdvanceStatus(lab.id)}>
    {statusCopy[lab.status]}
  </button>
</article>

<style>
  /* Base layout and card appearance. */
  .lab-card {
    display: grid;
    gap: 0.9rem;
    padding: 1rem;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(44, 44, 44, 0.9);
    box-shadow: 0 20px 38px rgba(0, 0, 0, 0.3);
  }

  .card-top,
  .title-row,
  .meta-row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .track-chip,
  .week-chip,
  .status-pill,
  .meta-row span {
    border-radius: 999px;
    padding: 0.35rem 0.7rem;
    font-size: 0.82rem;
  }

  .track-chip,
  .week-chip {
    background: rgba(255, 255, 255, 0.08);
    color: #aaaaaa;
  }

  .status-pill {
    font-weight: 700;
  }

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.2rem;
    color: #f6f6f6;
  }

  .summary {
    color: #888888;
  }

  .meta-row span {
    background: rgba(255, 62, 0, 0.1);
    color: #ff8a6a;
  }

  button {
    border: none;
    border-radius: 16px;
    padding: 0.82rem 1rem;
    font-weight: 700;
    color: white;
    background: #FF3E00;
  }

  /* Status-aware pill colors driven by the data-status attribute. */
  [data-status='Idea'] .status-pill {
    background: rgba(255, 62, 0, 0.15);
    color: #ff9980;
  }

  [data-status='Building'] .status-pill {
    background: rgba(255, 62, 0, 0.25);
    color: #ff6240;
  }

  [data-status='Ready to Demo'] .status-pill {
    background: rgba(255, 62, 0, 0.35);
    color: #FF3E00;
  }
</style>