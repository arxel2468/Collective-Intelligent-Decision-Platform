import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', '85e5f90c8ac20afbcdf52f10473bffaed974a656bb52363509d72d442c5615ef')
    APP_DIR = os.path.abspath(os.path.dirname(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, os.pardir))
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', '8b23b192d3d02ac199293c98d1d7f9a456110fa5daa87bd233f9e003edbbf8635945e3b8160aefbeb507e61d3d364141bb627eadc3eac448e954989aba6c108c8ff5cf3ee8566b6eae070f40239df46245b6437c86311b51242e681ef851399700e33e7fbb26027243d472e682d9196a5d52984572c79dfed75e7b88ced92c5c89e9138bbb7928f4d68bd94fb0dc1dfca0ec07efd2d4c9f392200d7d7f3b810c9999aa7f36471e33018ac7b433f164674547c5a5b1c87936fceb9e7bffaf33006c9b821c470c31ff371698386fec3db4577378dfdc85e28096adbcf7ac1db57f176916b208fed451b5e106a0cf03aea61c07abcbd952792f44641e3c9b348945')
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24  # 1 day

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///development.db')

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'
    JWT_ACCESS_TOKEN_EXPIRES = 5

class ProductionConfig(Config):
    """Production configuration."""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    SECRET_KEY = os.environ.get('SECRET_KEY')

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
