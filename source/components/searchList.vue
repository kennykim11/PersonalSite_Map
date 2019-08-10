
<template>
    <div>
        <searchItem
            v-for='pin in pins'
            v-bind:key = 'pin.id'
            :pin='pin'
        ></searchItem>
    </div>
</template>

<script>
    import searchItem from './searchItem.vue'
    export default {
        components: {
            searchItem
        },
        props: ['pins']
    }
</script>

<style scoped>
</style>

