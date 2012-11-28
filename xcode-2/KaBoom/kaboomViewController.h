//
//  kaboomViewController.h
//  KaBoom
//
//  Created by Peter Milkman on 11/23/12.
//  Copyright (c) 2012 Peter Milkman. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVAudioPlayer.h>


@interface kaboomViewController : UIViewController <UIPickerViewDataSource, UIPickerViewDelegate> {

    IBOutlet UIPickerView *pickerView;
    NSMutableArray *arrayNames;
    NSMutableArray *arraySounds;
    AVAudioPlayer *audioPlayer;
}
@property (weak, nonatomic) IBOutlet UIButton *button1;
- (IBAction)functionclick:(id)sender;

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag;
- (void)audioPlayerDecodeErrorDidOccur:(AVAudioPlayer *)player error:(NSError *)error;


@end
