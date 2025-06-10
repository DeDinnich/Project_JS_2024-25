<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">

    {{-- SEO Meta --}}
    <title>@yield('title', 'a remplir')</title>
    <meta name="description" content="@yield('description', 'a remplir')">
    <meta name="keywords" content="@yield('keywords', 'a remplir')">
    <meta name="robots" content="index, follow">

    {{-- Open Graph / Social Preview --}}
    <meta property="og:title" content="@yield('og_title', 'a remplir')">
    <meta property="og:description" content="@yield('og_description', 'a remplir')">
    <meta property="og:image" content="@yield('og_image', asset('images/og-default.jpg'))">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta name="twitter:card" content="summary_large_image">

    {{-- CSS (via Vite) --}}
    @if (app()->environment('production'))
        @vite(['resources/js/app.js'], 'build')
    @else
        @vite(['resources/js/app.js'])
    @endif

</head>
<body class="font-sans antialiased bg-white text-gray-900">

    {{-- HEADER --}}
    @include('partials.landing.header')

    {{-- CONTENU PRINCIPAL --}}
    <main>
        @yield('content')
    </main>

    {{-- FOOTER --}}
    @include('partials.landing.footer')

    {{-- JS personnalisé (optionnel) --}}
    @yield('js')
</body>
</html>
