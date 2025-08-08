import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import BottomNavigation from "@/components/bottom-navigation";
import LoadingScreen from "../components/loading-screen";
import { 
  Sparkles,
  Play,
  Star,
  Clock,
  Target
} from "lucide-react";
import type { Program } from "@shared/schema";
import styles from "./programs.module.css";

export default function Programs() {
  const [, setLocation] = useLocation();

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    queryFn: () => fetch(`/api/programs`).then(res => res.json()),
  });

  const { data: activeProgram } = useQuery<Program | null>({
    queryKey: ["/api/programs/active"],
    queryFn: () => fetch(`/api/programs/active`).then(res => res.json()),
  });

  if (isLoading) {
    return <LoadingScreen message="Loading your workout programs..." />;
  }

  return (
    <div className={`${styles.container} page`}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Programs</h1>
        <Button
          onClick={() => setLocation("/programs/generate")}
          size="sm"
          variant="primary"
        >
          <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
          Generate
        </Button>
      </div>

      <div className={styles.main}>
        {/* Active Program */}
        {activeProgram && (
          <Card style={{ marginBottom: '1.5rem', backgroundColor: '#eff6ff', borderColor: '#3b82f6' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1e40af', display: 'flex', alignItems: 'center' }}>
                <Star style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
                Active Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {activeProgram.name}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {activeProgram.description}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <Badge variant="outline">
                  <Clock style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {activeProgram.duration}
                </Badge>
                <Badge variant="outline">
                  <Target style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {activeProgram.difficulty}
                </Badge>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button
                  onClick={() => setLocation(`/programs/modify?id=${activeProgram.id}`)}
                  size="sm"
                  variant="outline"
                  style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                >
                  <Sparkles style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} />
                  Modify Program
                </Button>
                <Button
                  onClick={() => setLocation("/programs/generate")}
                  size="sm"
                  variant="primary"
                >
                  <Sparkles style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} />
                  Create New Program
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Programs List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {programs.length === 0 ? (
            <Card>
              <CardContent style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Sparkles style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#9ca3af' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  No Programs Yet
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Generate your first AI-powered workout program
                </p>
                <Button
                  onClick={() => setLocation("/programs/generate")}
                  variant="primary"
                >
                  <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Generate Program
                </Button>
              </CardContent>
            </Card>
          ) : (
            programs.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{program.name}</span>
                    {program.isActive && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    {program.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <Badge variant="outline">{program.duration}</Badge>
                    <Badge variant="outline">{program.difficulty}</Badge>
                    <Badge variant="outline">{program.daysPerWeek} days/week</Badge>
                  </div>
                  {!program.isActive && (
                    <Button size="sm" variant="outline">
                      <Play style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} />
                      Activate
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>



      <BottomNavigation />
    </div>
  );
}