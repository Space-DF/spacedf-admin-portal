import { NextRequest, NextResponse } from 'next/server';

// Mock data generator for device events
const generateMockEvents = (count: number = 11) => {
  const events = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Generate timestamp - subtract seconds for each event
    const eventTime = new Date(now.getTime() - i * 1000);

    events.push({
      timestamp: eventTime.toISOString(),
      node_id: 'test-node',
      event_code: '00 0C OF 01',
      data: [12, 'green', 25.93],
    });
  }

  return events;
};

export const GET = async (
  _: NextRequest,
  { params: _params }: { params: { id: string } },
) => {
  const mockEvents = generateMockEvents(11);

  return NextResponse.json({
    results: mockEvents,
    count: mockEvents.length,
  });
};
