import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Mail, Phone, MapPin, Shield, Calendar, Clock } from 'lucide-react';

interface InvestigatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investigatorId: string;
}

export function InvestigatorModal({ open, onOpenChange, investigatorId }: InvestigatorModalProps) {
  // Mock investigator data - in real app, this would come from an API
  const investigator = {
    id: investigatorId,
    name: investigatorId,
    email: `${investigatorId.toLowerCase().replace(' ', '.')}@example.com`,
    phone: '+1 (555) 123-4567',
    department: 'Corporate Security',
    title: 'Senior Investigator',
    location: 'Seattle, WA',
    certifications: ['CFE', 'CFI', 'CPP'],
    experience: '8 years',
    activeCases: 12,
    completedCases: 247,
    specializations: ['Financial Fraud', 'Workplace Violence', 'Data Theft'],
    availability: 'Available',
    lastActive: new Date().toLocaleDateString()
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {investigator.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <DialogTitle>{investigator.name}</DialogTitle>
              <p className="text-sm text-gray-600">{investigator.title}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{investigator.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{investigator.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{investigator.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{investigator.department}</span>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Experience:</span>
                <span className="text-sm font-medium text-gray-900">{investigator.experience}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Cases:</span>
                <Badge className="bg-blue-100 text-blue-800">{investigator.activeCases}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed:</span>
                <Badge className="bg-green-100 text-green-800">{investigator.completedCases}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className="bg-green-500 text-white">{investigator.availability}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {investigator.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {investigator.specializations.map((spec, index) => (
                  <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Active */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last Active:</span>
            <span>{investigator.lastActive}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
