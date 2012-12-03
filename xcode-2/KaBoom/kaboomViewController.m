//
//  kaboomViewController.m
//  KaBoom
//
//  Created by Peter Milkman on 11/23/12.
//  Copyright (c) 2012 Peter Milkman. All rights reserved.
//

#import "kaboomViewController.h"
#import <AVFoundation/AVAudioPlayer.h>
#import <AVFoundation/AVAudioSession.h>

@interface kaboomViewController ()

@end

@implementation kaboomViewController
@synthesize button1;

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.

    arrayNames = [[NSMutableArray alloc] init];
    [arrayNames addObject:@"A-Bomb"];
    [arrayNames addObject:@"Big Bang"];
    [arrayNames addObject:@"Catastrophe"];
    [arrayNames addObject:@"Explosion"];
    [arrayNames addObject:@"Fireball"];
    [arrayNames addObject:@"Hit and Run"];
    [arrayNames addObject:@"Howitzer"];
    [arrayNames addObject:@"Laser Beam"];
    [arrayNames addObject:@"Ray Gun"];
    
    arraySounds = [[NSMutableArray alloc] init];
    [arraySounds addObject:@"A-Bomb"];
    [arraySounds addObject:@"big-bang"];
    [arraySounds addObject:@"Catastrophe"];
    [arraySounds addObject:@"Explosion"];
    [arraySounds addObject:@"Fireball"];
    [arraySounds addObject:@"hit-and-run"];
    [arraySounds addObject:@"Howitzer"];
    [arraySounds addObject:@"Laser Beam"];
    [arraySounds addObject:@"ray-gun"];

}

- (NSString *)pickerView:(UIPickerView *)thePickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component {
    return [arrayNames objectAtIndex:row];
}

- (void)applicationDidFinishLaunching:(UIApplication *)application {
    
    [[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayback error:nil];
}

- (void)pickerView:(UIPickerView *)thePickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component {
    
//    NSLog(@"Selected Color: %@. Index of selected color: %i", [arrayNames objectAtIndex:row], row);
}

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)thePickerView {
    
    return 1;
}

- (NSInteger)pickerView:(UIPickerView *)thePickerView numberOfRowsInComponent:(NSInteger)component {
    
    return [arrayNames count];
}

- (void)viewDidUnload
{
    button1 = nil;
    [self setButton1:nil];
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}

- (IBAction)functionclick:(id)sender {
    NSInteger selectedOption = [pickerView selectedRowInComponent:0];
    NSString *filePath = [arraySounds objectAtIndex:selectedOption];
	NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:filePath ofType:@"mp3"]];
 //   NSLog(@"%@", filePath);
    
    NSError *error;
    audioPlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:url error:&error];
    audioPlayer.numberOfLoops = 0;
    
    [audioPlayer prepareToPlay];
    [audioPlayer play];
     //               [audioPlayer release];
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag {
	if (flag) {
//		NSLog(@"[COLOR=\"red\"]Did finish playing[/COLOR]");
    } else {
//        NSLog(@"[COLOR=\"red\"]Did NOT finish playing[/COLOR]");
    }
}

- (void)audioPlayerDecodeErrorDidOccur:(AVAudioPlayer *)player error:(NSError *)error {
 //   NSLog(@"%s", "[[COLOR=\"red\"]error description[/COLOR]]");
}
@end
