import React from "react";
import { useAuth } from "../../System/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout.tsx";
import Button from "../../basic/Button/Button.tsx";

const NotFound: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const notFoundElement = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
            <h1 style={{ fontSize: '6rem', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Сторінку не знайдено</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Вибачте, але сторінка, яку ви шукаєте, не існує.</p>
            {!user && (
                <Button
                    onClick={() => navigate('/')}
                >
                    Повернутися на головну
                </Button>
            )}
        </div>
    );

    return user ? (
        <Layout>{notFoundElement}</Layout>
    ) : notFoundElement;
};

export default NotFound;
