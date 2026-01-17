import React from "react";
import {useAuth} from "@/core/auth/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {Button} from "@/shared/ui/buttons/button.tsx";

const NotFound: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
        }}>
            <h1 style={{fontSize: '6rem', marginBottom: '1rem'}}>404</h1>
            <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Сторінку не знайдено</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem'}}>Вибачте, але сторінка, яку ви шукаєте, не існує.</p>
            {!user && (
                <Button
                    onClick={() => navigate('/')}
                >
                    Повернутися на головну
                </Button>
            )}
        </div>
    )
};

export default NotFound;









