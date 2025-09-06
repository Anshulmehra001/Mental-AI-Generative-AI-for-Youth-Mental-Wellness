import { AlertTriangle, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CrisisInterventionProps {
  isActive: boolean;
  onClose: () => void;
}

const CrisisIntervention = ({ isActive, onClose }: CrisisInterventionProps) => {
  const crisisResources = [
    {
      name: 'AASRA',
      description: '24/7 Suicide Prevention Helpline',
      phone: '91-9820466726',
      available: '24 hours'
    },
    {
      name: 'iCALL',
      description: 'Psychological Support',
      phone: '022-25521111',
      available: 'Mon-Sat, 8am-10pm'
    },
    {
      name: 'Vandrevala Foundation',
      description: 'Mental Health Support',
      phone: '9999666555',
      available: '24 hours'
    },
    {
      name: 'NIMHANS',
      description: 'National Institute of Mental Health',
      phone: '080-26995000',
      available: 'Business hours'
    }
  ];

  const onlineResources = [
    {
      name: 'YourDOST',
      description: 'Online counseling platform',
      url: 'https://yourdost.com'
    },
    {
      name: 'BetterHelp India',
      description: 'Professional therapy online',
      url: 'https://betterhelp.com'
    }
  ];

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card border-red-500/50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Crisis Support Resources</h2>
              <p className="text-muted-foreground">You're not alone. Help is available right now.</p>
            </div>
          </div>

          <Alert className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-foreground">
              If you're having thoughts of self-harm or suicide, please reach out for immediate help. 
              These feelings are temporary, but the support you need is available right now.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Helplines (India)
              </h3>
              <div className="grid gap-3">
                {crisisResources.map((resource, index) => (
                  <Card key={index} className="p-4 bg-card/50 border-primary/20">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                        <p className="text-xs text-muted-foreground">Available: {resource.available}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`tel:${resource.phone}`, '_self')}
                        className="ml-4"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                    <div className="mt-2">
                      <span className="font-mono text-lg text-primary">{resource.phone}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Online Support
              </h3>
              <div className="grid gap-3">
                {onlineResources.map((resource, index) => (
                  <Card key={index} className="p-4 bg-card/50 border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-foreground">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-foreground">Immediate Safety Tips:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Remove any means of self-harm from your immediate environment</li>
                <li>• Stay with someone you trust or call a friend/family member</li>
                <li>• Go to your nearest emergency room if you're in immediate danger</li>
                <li>• Remember: These feelings are temporary and will pass</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={onClose} variant="outline" className="flex-1">
                I'm Safe Now
              </Button>
              <Button 
                onClick={() => window.open('tel:112', '_self')} 
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Emergency 112
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CrisisIntervention;