declare module 'next' {
  export interface Metadata {
    title?: string | { default: string; template: string }
    description?: string
    [key: string]: any
  }
  export interface Viewport {
    themeColor?: string | Array<{ media?: string; color: string }>
    width?: string
    initialScale?: number
    maximumScale?: number
    userScalable?: boolean
    [key: string]: any
  }
}

declare module 'next/types.js' {
  export type ResolvingMetadata = Promise<any>
  export type ResolvingViewport = Promise<any>
}

declare module 'next/types' {
  export type ResolvingMetadata = Promise<any>
  export type ResolvingViewport = Promise<any>
}

declare module 'next/link' {
  import * as React from 'react'
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string | { pathname: string; query?: Record<string, any> }
    replace?: boolean
    scroll?: boolean
    prefetch?: boolean
  }
  const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>
  export default Link
}

declare module 'next/link.js' {
  import * as React from 'react'
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string | { pathname: string; query?: Record<string, any> }
    replace?: boolean
    scroll?: boolean
    prefetch?: boolean
  }
  const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>
  export default Link
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void
    replace(href: string): void
    refresh(): void
    back(): void
    forward(): void
    prefetch(href: string): void
  }
  export function usePathname(): string
  export function useSearchParams(): URLSearchParams
  export function redirect(url: string): never
  export function notFound(): never
}

declare module 'next/navigation.js' {
  export function useRouter(): {
    push(href: string): void
    replace(href: string): void
    refresh(): void
    back(): void
    forward(): void
    prefetch(href: string): void
  }
  export function usePathname(): string
  export function useSearchParams(): URLSearchParams
  export function redirect(url: string): never
  export function notFound(): never
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse
    static next(init?: { request?: { headers?: Headers }; headers?: Headers }): NextResponse
    cookies: {
      get(name: string): { name: string; value: string } | undefined
      getAll(): Array<{ name: string; value: string }>
      set(name: string, value: string, options?: any): void
      delete(name: string): void
      has(name: string): boolean
      clear(): void
    }
  }
  export interface NextRequest extends Request {
    nextUrl: URL & {
      basePath: string
      pathname: string
      searchParams: URLSearchParams
    }
    cookies: {
      get(name: string): { name: string; value: string } | undefined
      getAll(): Array<{ name: string; value: string }>
      set(name: string, value: string, options?: any): void
      delete(name: string): void
      has(name: string): boolean
      clear(): void
    }
    ip?: string
    geo?: {
      city?: string
      country?: string
      region?: string
      latitude?: string
      longitude?: string
    }
  }
}

declare module 'next/server.js' {
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse
    static next(init?: { request?: { headers?: Headers }; headers?: Headers }): NextResponse
    cookies: {
      get(name: string): { name: string; value: string } | undefined
      getAll(): Array<{ name: string; value: string }>
      set(name: string, value: string, options?: any): void
      delete(name: string): void
      has(name: string): boolean
      clear(): void
    }
  }
  export interface NextRequest extends Request {
    nextUrl: URL & {
      basePath: string
      pathname: string
      searchParams: URLSearchParams
    }
    cookies: {
      get(name: string): { name: string; value: string } | undefined
      getAll(): Array<{ name: string; value: string }>
      set(name: string, value: string, options?: any): void
      delete(name: string): void
      has(name: string): boolean
      clear(): void
    }
    ip?: string
    geo?: {
      city?: string
      country?: string
      region?: string
      latitude?: string
      longitude?: string
    }
  }
}

declare module 'next/headers' {
  export function cookies(): Promise<{
    get(name: string): { name: string; value: string } | undefined
    getAll(): Array<{ name: string; value: string }>
    set(name: string, value: string, options?: any): void
    delete(name: string): void
    has(name: string): boolean
  }>
  export function headers(): Promise<Headers>
}

declare module 'next/headers.js' {
  export function cookies(): Promise<{
    get(name: string): { name: string; value: string } | undefined
    getAll(): Array<{ name: string; value: string }>
    set(name: string, value: string, options?: any): void
    delete(name: string): void
    has(name: string): boolean
  }>
  export function headers(): Promise<Headers>
}
