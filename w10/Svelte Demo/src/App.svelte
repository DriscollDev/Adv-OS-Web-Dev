<script>
  import LabCard from './lib/LabCard.svelte'
  import MetricCard from './lib/MetricCard.svelte'

  const statusOrder = ['Idea', 'Building', 'Ready to Demo']
  const trackOptions = ['Frontend', 'Full Stack', 'Data Viz', 'Developer Tools']

  // Seed data
  const starterProjects = [
    {
      id: '1',
      title: 'Esports Team Assistant',
      track: 'Frontend',
      week: 10,
      status: 'Ready to Demo',
      stack: 'Svelte, fetch, REST API',
      summary: 'User can track player ranks for teams in their tournament'
    },
    {
      id: '2',
      title: 'Live Support Queue',
      track: 'Frontend',
      week: 11,
      status: 'Building',
      stack: 'Svelte, Express, WebSocket',
      summary: 'A lightweight queue that updates in real-time so support agents and users can track wait times without refreshing.'
    },
    {
      id: '3',
      title: 'Algorithm Visualizer',
      track: 'Data Viz',
      week: 12,
      status: 'Idea',
      stack: 'Svelte motion, SVG, stores',
      summary: 'Interactive step-through views for sorting, searching, and graph algorithms so users can understand each state transition.'
    },
    {
      id: '4',
      title: 'Commit Message Helper',
      track: 'Developer Tools',
      week: 13,
      status: 'Building',
      stack: 'Svelte, form bindings, llm integration',
      summary: 'Assists developers in writing clear, consistent commit messages and tracks adherence to commit conventions.'
    }
  ]

  // Local reactive state managed with Svelte runes.
  let selectedTrack = $state('All')
  let searchText = $state('')
  let showDemoReadyOnly = $state(false)
  let projects = $state(starterProjects)
  let draft = $state({
    title: '',
    track: 'Full Stack',
    week: 14,
    summary: ''
  })

  const trackFilters = $derived(['All', ...trackOptions])

  // Derived list updates automatically when filters or project data changes.
  const filteredProjects = $derived.by(() => {
    const query = searchText.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesTrack = selectedTrack === 'All' || project.track === selectedTrack
      const matchesStatus = !showDemoReadyOnly || project.status === 'Ready to Demo'
      const matchesQuery =
        query.length === 0 ||
        project.title.toLowerCase().includes(query) ||
        project.summary.toLowerCase().includes(query) ||
        project.stack.toLowerCase().includes(query)

      return matchesTrack && matchesStatus && matchesQuery
    })
  })

  // Dashboard metrics computed from the same projects source of truth.
  const readyProjects = $derived(projects.filter((project) => project.status === 'Ready to Demo').length)
  const buildingProjects = $derived(projects.filter((project) => project.status === 'Building').length)
  const completionRate = $derived(
    projects.length ? Math.round((readyProjects / projects.length) * 100) : 0
  )

  // Move a card to the next workflow state and wrap back to the first status.
  function advanceStatus(projectId) {
    projects = projects.map((project) => {
      if (project.id !== projectId) {
        return project
      }

      const currentIndex = statusOrder.indexOf(project.status)
      const nextIndex = (currentIndex + 1) % statusOrder.length

      return {
        ...project,
        status: statusOrder[nextIndex]
      }
    })
  }

  // Create a new project from the form and insert it at the top of the board.
  function addProject() {
    const title = draft.title.trim()
    const summary = draft.summary.trim()

    if (!title || !summary) {
      return
    }

    projects = [
      {
        id: crypto.randomUUID(),
        title,
        track: draft.track,
        week: Number(draft.week),
        status: 'Idea',
        stack: 'Svelte, components, bindings',
        summary
      },
      ...projects
    ]

    draft = {
      title: '',
      track: draft.track,
      week: draft.week,
      summary: ''
    }
  }
</script>

<main class="shell">
  <!-- Intro panel describing what this demo app showcases. -->
  <section class="hero panel">
    <div class="hero-copy">
      <p class="eyebrow">Demo App</p>
      <h1>Sprint Studio</h1>
      <div class="hero-points">
        <span>Reactive filters</span>
        <span>Live project metrics</span>
        <span>Component-based UI</span>
      </div>
    </div>

    <div class="hero-note">
      <p class="hero-note-label">Note</p>
      <p class="hero-note-body">
        No DB usage in this, as its a demo primarily focused on Svelte's reactivity and bindings.
      </p>
    </div>
  </section>

  <!-- High-level metrics that react to the current project list. -->
  <section class="metrics">
    <MetricCard title="Total Ideas" value={projects.length} detail="Projects currently in the board" tone="neutral" />
    <MetricCard title="In Progress" value={buildingProjects} detail="Work that still needs implementation and testing" tone="warm" />
    <MetricCard title="Demo Ready" value={readyProjects} detail="Features that a team could realistically present today" tone="cool" />
    <MetricCard title="Completion" value={`${completionRate}%`} detail={`Percentage of projects demo ready`} tone="accent" />
  </section>

  <!-- Main workspace: board and form side-by-side on larger screens. -->
  <section class="workspace-grid">
    <section class="panel board-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Board</p>
          <h2>Capstone Ideas</h2>
        </div>
        <p class="section-note">Change any filter and Svelte recalculates the view immediately.</p>
      </div>

      <div class="controls">
        <!-- Search + filtering controls are directly bound to reactive state. -->
        <label>
          <span>Search</span>
          <input bind:value={searchText} type="search" placeholder="Search title, summary, or stack" />
        </label>

        <label>
          <span>Track</span>
          <select bind:value={selectedTrack}>
            {#each trackFilters as track}
              <option value={track}>{track}</option>
            {/each}
          </select>
        </label>

        <label class="checkbox-row">
          <input bind:checked={showDemoReadyOnly} type="checkbox" />
          <span>Show demo-ready only</span>
        </label>
      </div>

      <div class="project-grid">
        {#each filteredProjects as project (project.id)}
          <LabCard lab={project} onAdvanceStatus={advanceStatus} />
        {:else}
          <div class="empty-state">
            <h3>No matches</h3>
            <p>Try clearing the search text or unchecking the demo-ready filter.</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="panel sidebar-panel">
      <div class="section-heading compact">
        <div>
          <p class="eyebrow">Intake/Bindings</p>
          <h2>Add a Project</h2>
        </div>
      </div>

      <div class="form-stack">
        <!-- Two-way bindings keep the form and draft preview in sync. -->
        <label>
          <span>Project title</span>
          <input bind:value={draft.title} type="text" placeholder="Example: Internship Tracker" />
        </label>

        <label>
          <span>Track</span>
          <select bind:value={draft.track}>
            {#each trackOptions as track}
              <option value={track}>{track}</option>
            {/each}
          </select>
        </label>

        <div class="">
          <label>
            <span>Weeks</span>
            <input bind:value={draft.week} type="number" min="10" max="16" />
          </label>
        </div>

        <label>
          <span>Summary</span>
          <textarea bind:value={draft.summary} rows="5" placeholder="Describe what the app does and what makes it useful."></textarea>
        </label>

        <button class="primary-button" type="button" onclick={addProject}>Add to board</button>
      </div>

      <div class="preview-card">
        <!-- Preview reflects the draft object in real time. -->
        <p class="preview-label">Live preview</p>
        <h3>{draft.title || 'Your next project idea'}</h3>
        <p>{draft.summary || 'As students type, the preview updates automatically through Svelte bindings.'}</p>
        <div class="preview-meta">
          <span>{draft.track}</span>
          <span>{draft.week} Weeks</span>
        </div>
      </div>
    </section>
  </section>
</main>
