<div class="container">
	{#each animations as animation}
		<div class="tile">
			<a href={`/animations/${animation.name}`}>
				<img class="thumbnail" src={animation.frames[0]} alt={animation.name} />
				<h3>{animation.name}</h3>
			</a>
		</div>
	{/each}
</div>
