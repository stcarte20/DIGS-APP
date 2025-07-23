import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Users,
  MapPin
} from 'lucide-react';

export function Calendar() {
  // Mock upcoming events
  const upcomingEvents = [
    {
      id: '1',
      title: 'Case Review Meeting',
      date: '2025-07-24',
      time: '9:00 AM',
      type: 'meeting',
      location: 'Conference Room A',
      attendees: ['John Investigator', 'Jane Manager']
    },
    {
      id: '2',
      title: 'Witness Interview',
      date: '2025-07-24',
      time: '2:00 PM',
      type: 'interview',
      location: 'Interview Room 1',
      attendees: ['John Investigator']
    },
    {
      id: '3',
      title: 'ERU Deadline',
      date: '2025-07-25',
      time: '5:00 PM',
      type: 'deadline',
      location: 'DIGS-2024-001',
      attendees: []
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Calendar</h1>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              July 2025
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Calendar Component Coming Soon</p>
            <p>Full calendar functionality will be implemented in a future update</p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your scheduled appointments and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'interview' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {event.date} at {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                    )}
                    {event.attendees.length > 0 && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
