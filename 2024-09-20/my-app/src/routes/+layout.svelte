<script>
	import { page } from '$app/stores';
</script>

<nav>
	<a href="/" class:active={$page.url.pathname === '/'}>Animator</a>
	<a href="/animations" class:active={$page.url.pathname === '/animations'}>My Animations</a>
</nav>

<slot></slot>

<style>
	nav {
		display: flex;
		justify-content: space-around;
		padding: 1rem 0;
		background-color: #f0f0f0;
	}

	a {
		text-decoration: none;
		color: #333;
		padding: 0.5rem 1rem;
		font-size: 1.1rem;
		transition: background-color 0.3s;
	}

	a:hover,
	a.active {
		background-color: #ddd;
	}

	@media (max-width: 600px) {
		a {
			padding: 1rem;
			font-size: 1.2rem;
		}
	}
</style>
