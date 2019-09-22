# Libraries
import os
import pickle
import cv2
import numpy as np
import imutils
import dlib
import face_recognition
from datetime import datetime,timedelta
import sqlite3
# Movement detection
# https://docs.opencv.org/4.1.0/d1/dc5/tutorial_background_subtraction.html
# 1. try cv2.createBackgroundSubtractorKNN()
def init_db():
    conn = sqlite3.connect('N2.db',detect_types=sqlite3.PARSE_DECLTYPES)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS motion(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dev_id INTEGER NOT NULL, 
    sync BOOLEAN DEFAULT 0,
    tstamp string NOT NULL)''')
    conn.commit()
    conn.close()
    
def insert_motion(value):
    conn = sqlite3.connect('N2.db',detect_types=sqlite3.PARSE_DECLTYPES)
    c = conn.cursor()    
    qtxt = "INSERT INTO motion(dev_id,tstart) VALUES (303,'%s')"%(value)
    print(qtxt)
    c.execute(qtxt)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    backSub = cv2.createBackgroundSubtractorMOG2()
    cap = cv2.VideoCapture(0)

    print('Press q to exit')
    startCap=False
    cnt=0
    showStr=""
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    while cap.isOpened():
        ret,frame = cap.read()
        frame1=frame
        fgMask = backSub.apply(frame)
        fgMask = cv2.dilate(fgMask, None, iterations = 1)    
        fgMask = cv2.erode(fgMask, None, iterations = 1)
        count=(fgMask>200)
        sumCnt=np.sum(count)
        #print(conut.size,np.sum(count))
        if sumCnt>10000 and cnt>50:
            
            if not(startCap):
                showStr="Motion Detect"
                sttime=datetime. now()
                sttime=str(sttime.strftime('%Y_%m_%d_%H_%M_%S'))
                
                out = cv2.VideoWriter(sttime+'.avi', fourcc, 20.0, (640,  480))
                cv2.imwrite('camera1.jpg',frame)
                #print(sttime+'.avi')
                #insert_motion(sttime)
            startCap=True
            out.write(frame)
        if startCap and sumCnt<=2000:
            #out.release()
            startCap=False
            print("close")
            showStr=""
        cv2.imshow('Mask', fgMask)
        frame = cv2.bitwise_and(frame, frame, mask=fgMask)
        cv2.imshow('Mask', frame1)
        
        cv2.rectangle(frame, (10, 2), (300,20), (255,255,255), -1)
        cv2.putText(frame, str(np.sum(count))+" "+showStr, (15, 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5 , (0,0,0))     
        
        cv2.imshow('Moving', frame)
        cnt=cnt+1
        if cv2.waitKey(100) & 0xFF == ord('q'):
            break
    cap.release()
    out.release()
    cv2.destroyAllWindows() 
