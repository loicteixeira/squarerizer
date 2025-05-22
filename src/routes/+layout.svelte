<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="m-8 bg-white text-black">
	{@render children()}
</div>
