import { NextResponse } from 'next/server'

/** Map Supabase/Postgres errors on category writes to actionable API responses. */
export function registrationCategoryWriteErrorResponse(error: { message: string }): NextResponse | null {
  const m = error.message
  if (
    /does not exist|schema cache|Could not find the .* column/i.test(m) &&
    /role_kind|expected_hours|grants_staff_access|check_in_valid/i.test(m)
  ) {
    return NextResponse.json(
      {
        error:
          'Registration categories need a database update. In Supabase, run migrations dancecard_033_registration_category_grants_staff.sql, dancecard_034_registration_category_role_hours.sql, and dancecard_036_registrant_checkin.sql (in order), then refresh.',
        needsMigration: true,
      },
      { status: 409 },
    )
  }
  if (/unique|duplicate|dancecard_registration_categories_event_lower_name/i.test(m)) {
    return NextResponse.json(
      { error: 'A category with this name already exists for this event. Use a different display name.' },
      { status: 409 },
    )
  }
  return null
}
