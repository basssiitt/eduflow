import { PublicLanding } from '@/components/public-landing'

export function LandingWithParentMockup() {
  return (
    <>
      <PublicLanding />
      <style dangerouslySetInnerHTML={{ __html: `
        main > section:first-of-type > div > div > div:first-child {
          position: relative;
          min-height: 620px;
        }
        main > section:first-of-type > div > div > div:first-child > div:first-child {
          visibility: hidden;
        }
        main > section:first-of-type > div > div > div:first-child::after {
          content: "";
          position: absolute;
          inset: 0;
          background: url('/eduflow-parent-portal-iphone.svg') center center / contain no-repeat;
          pointer-events: none;
        }
        @media (max-width: 1023px) {
          main > section:first-of-type > div > div > div:first-child {
            min-height: 590px;
          }
        }
        @media (max-width: 640px) {
          main > section:first-of-type > div > div > div:first-child {
            min-height: 520px;
          }
        }
      ` }}
    </>
  )
}
