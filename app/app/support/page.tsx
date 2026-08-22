export default function SupportPage() {
  return (
    <div className="max-w-[38rem]">
      <h1 className="page-title text-[28px] leading-[1.2]">Get support</h1>
      <p className="mt-3 text-[16px] leading-[1.55] text-ink-soft">
        Staff questions, a stuck clock, or a family link that expired. Write us. We read mail at
        hello@freeiep.org. This is not a district help desk and not legal advice.
      </p>
      <div className="card mt-6 space-y-3 p-5">
        <p className="text-[15px]">
          Include the student first name only if you must. Skip extra identifiers.
        </p>
        <a className="btn btn-primary" href="mailto:hello@freeiep.org?subject=FreeIEP%20support">
          Email hello@freeiep.org
        </a>
      </div>
    </div>
  );
}
