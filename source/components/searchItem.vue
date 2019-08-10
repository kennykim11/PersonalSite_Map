<template>
    <div>
        <img class=image :src="pin.image"/>
        <p class=title>{{pin.title}}</p>
        <p class=shortDescrip>{{pin.shortDescrip}}</p>
    </div> 
</template>

<script>
    export default {
        props: ['pin']
    }
</script>

<style scoped>
    .title{
        font-family: 'Courier New', Courier, monospace
    }
</style>

